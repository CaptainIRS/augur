from datetime import timedelta, datetime, timezone
from functools import wraps
from flask import Flask, jsonify, session, redirect, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass
from sqlalchemy import Integer, DateTime, Enum, String, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from dotenv import load_dotenv
import os
import enum

load_dotenv()
BASE_URL = os.getenv("BASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URI = os.getenv("DATABASE_URI")
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


class UserType(enum.Enum):
    SCIENTIST = "scientist"
    ORGANIZATION = "organization"
    ADMIN = "admin"


class ContestEarnings(db.Model):
    __tablename__ = "contest_earnings"
    contest_id: Mapped[int] = mapped_column(
        ForeignKey("contests.contest_id"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), primary_key=True)
    earnings: Mapped[float] = mapped_column(Float, nullable=False)

    user: Mapped["User"] = relationship(back_populates="winners")
    contest: Mapped["Contest"] = relationship(back_populates="earnings")


class User(db.Model):
    __tablename__ = "users"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    user_type: Mapped[UserType] = mapped_column(Enum, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, onupdate=datetime.now
    )

    contests: Mapped[list["Contest"]] = relationship()

    earnings: Mapped[list["ContestEarnings"]] = relationship(back_populates="user")


class Contest(db.Model):
    __tablename__ = "contests"
    contest_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    contest_name: Mapped[str] = mapped_column(String, nullable=False)
    contest_description: Mapped[str] = mapped_column(String, nullable=False)
    contest_start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    contest_rounds: Mapped[int] = mapped_column(Integer, nullable=False)
    contest_round_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    contest_prize: Mapped[int] = mapped_column(Integer, nullable=False)

    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    organizer: Mapped["User"] = relationship(back_populates="contests")

    winners: Mapped[list["ContestEarnings"]] = relationship(back_populates="contest")


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


app.run(port=9999, debug=True)
