FROM golang:1.14.4
MAINTAINER ismak89@icloud.com
RUN mkdir -p /go/src/uds-online/api
WORKDIR /go/src/uds-online/api
COPY . .
EXPOSE 7000
RUN go get -d -v ./...
RUN go install -v ./...
RUN go build -o main .
CMD ./main