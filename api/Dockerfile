FROM golang:1.15.3
MAINTAINER ismak89@icloud.com
RUN mkdir -p /go/src/uds-online/api
WORKDIR /go/src/uds-online/api
COPY . .
EXPOSE 7000
RUN go mod download
RUN go build -o main .
CMD ./main