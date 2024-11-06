from datetime import timedelta, datetime, timezone
from functools import wraps
from flask import Flask, jsonify, session, redirect, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass
from sqlalchemy import Integer, DateTime, Enum, String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from dotenv import load_dotenv
from web3 import Web3
from websockets import connect
import asyncio
import os
import base64
import json

load_dotenv()
BASE_URL = os.getenv("BASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URI = os.getenv("DATABASE_URI")
INFURA_KEY = os.getenv("INFURA_KEY")
INFURA_SECRET = os.getenv("INFURA_SECRET")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = Web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
USER_ID_KEY = "user_id"
UTC = timezone.utc


class Base(DeclarativeBase, MappedAsDataclass):
    pass


app = Flask(__name__)
CORS(app, origins=[BASE_URL], supports_credentials=True)
app.secret_key = SECRET_KEY
app.permanent_session_lifetime = timedelta(days=30)
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_NAME="augur_session",
    SESSION_COOKIE_PARTITIONED=True,
    SQLALCHEMY_DATABASE_URI=DATABASE_URI,
)
app.static_folder = "static"

db = SQLAlchemy(model_class=Base)
db.init_app(app)

data = f"{INFURA_KEY}:{INFURA_SECRET}".encode("ascii")
basic_auth_token = base64.b64encode(data).strip().decode("utf-8")
infura_sepolia_endpoint = f"https://sepolia.infura.io/v3/{INFURA_KEY}"
headers = dict(Authorization=f"Basic {basic_auth_token}")
w3 = Web3(
    Web3.HTTPProvider(infura_sepolia_endpoint, request_kwargs=dict(headers=headers))
)
w3.eth.default_account = w3.eth.account.from_key(PRIVATE_KEY)

with open("abi.json") as f:
    abi = json.load(f)
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)

message_event = contract.events.ContestCreated()
block_filter = w3.eth.filter({"fromBlock": "latest", "address": CONTRACT_ADDRESS})


def handle_events(event):
    global app
    with app.app_context():
        receipt = w3.eth.wait_for_transaction_receipt(event["transactionHash"])
        result = message_event.process_receipt(receipt)
        print(result[0]["args"])
        if "contestID" in result[0]["args"] and "metadata" in result[0]["args"]:
            db.session.add(
                Contest(
                    contest_id=result[0]["args"]["contestID"],
                    contest_metadata=str(result[0]["args"]["metadata"]),
                )
            )


def log_loop(event_filter):
    entries = event_filter.get_new_entries()
    while True:
        if len(entries) == 0:
            entries = event_filter.get_new_entries()
            continue
        else:
            break
    print(f"event_filter_length: {entries}")
    for event in entries:
        handle_events(event)
        print(f"event_filter: {event_filter}, event: {event}")


async def get_event():
    global block_filter
    async with connect(f"wss://sepolia.infura.io/ws/v3/{INFURA_KEY}") as ws:
        await ws.send(
            json.dumps(
                {
                    "id": 1,
                    "method": "eth_subscribe",
                    "params": ["logs", {"address": [f"{CONTRACT_ADDRESS}"]}],
                }
            )
        )
        subscription_response = await ws.recv()
        print(f"Subscription response: {subscription_response}")
        while True:
            try:
                await asyncio.wait_for(ws.recv(), timeout=300)
                log_loop(block_filter)
            except asyncio.exceptions.TimeoutError:
                block_filter = w3.eth.filter(
                    {"fromBlock": "latest", "address": CONTRACT_ADDRESS}
                )
                print("Block filter has been reset")
            except ValueError as e:
                print(e)


# class UserType(enum.Enum):
#     SCIENTIST = "scientist"
#     ORGANIZATION = "organization"
#     ADMIN = "admin"


# class ContestEarnings(db.Model):
#     __tablename__ = "contest_earnings"
#     contest_id: Mapped[int] = mapped_column(
#         ForeignKey("contests.contest_id"), primary_key=True
#     )
#     user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
#     earnings: Mapped[float] = mapped_column(Float, nullable=False)

#     user: Mapped["User"] = relationship(back_populates="winners")
#     contest: Mapped["Contest"] = relationship(back_populates="earnings")


# class User(db.Model):
#     __tablename__ = "users"
#     user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     username: Mapped[str] = mapped_column(String, nullable=False)
#     password: Mapped[str] = mapped_column(String, nullable=False)
#     user_type: Mapped[UserType] = mapped_column(Enum, nullable=False)

#     contests: Mapped[list["Contest"]] = relationship()

#     earnings: Mapped[list["ContestEarnings"]] = relationship(back_populates="user")

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime, nullable=False, default=datetime.now
#     )
#     updated_at: Mapped[datetime] = mapped_column(
#         DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
#     )


class Contest(db.Model):
    __tablename__ = "contests"
    contest_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    contest_metadata: Mapped[str] = mapped_column(String, nullable=False)
    # contest_name: Mapped[str] = mapped_column(String, nullable=False)
    # contest_description: Mapped[str] = mapped_column(String, nullable=False)
    # contest_start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    # contest_rounds: Mapped[int] = mapped_column(Integer, nullable=False)
    # contest_round_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    # contest_prize: Mapped[int] = mapped_column(Integer, nullable=False)

    # organizer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    # organizer: Mapped["User"] = relationship(back_populates="contests")

    # winners: Mapped[list["ContestEarnings"]] = relationship(back_populates="contest")


with app.app_context():
    db.create_all()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if USER_ID_KEY not in session:
            return jsonify(error="Login required"), 403
        return f(*args, **kwargs)

    return decorated_function


@app.route("/")
def index():
    return redirect(url_for("login"))


@app.route("/contests")
def get_contests():
    contests = Contest.query.all()
    return jsonify(contests)


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(get_event())
    app.run(port=9999, debug=True)
