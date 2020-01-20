FROM golang:1.12

WORKDIR /go/src/db-init

COPY main.go .

RUN go get -d -v ./...
RUN go install -v ./...

CMD ["db-init"]
