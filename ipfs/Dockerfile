FROM ipfs/go-ipfs:v0.14.0

COPY setup.sh /usr/local/bin/start_ipfs
RUN chmod 0755 /usr/local/bin/start_ipfs

ENV LIBP2P_FORCE_PNET 1

ENTRYPOINT ["/usr/local/bin/start_ipfs"]
