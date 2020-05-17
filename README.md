# Undostres Project
This project consists of 2 frontend parts (public and admin) and API.

### Stack
* React
* Redux
* Typescript
* Golang
* MySQL
* AWS S3 SDK
* Docker

### Requirements
* Ubuntu 18+
* Docker Engine, Docker-Compose

### Before starting the app:
* It is recommended to clone the repository to a folder in 
home directory.
* Copy `Docker/default.env` file as `Docker/.env`
* Configure the environment by the mentioned above `.env` file
* Copy `nginx/nginx._conf` file as `nginx/nginx.conf`. Configure it.
* Let's Encrypt: configure `letsencrypt.sh` by editing it and entering 
your email and domains. To debug it, use staging option (see the file's 
contents). When ready, launch the script:
```shell script
sudo bash letsencrypt.sh
```
### To start:
```shell script
sudo docker-compose up -d
```

### To rebuild and start:
```shell script
sudo docker-compose up -d --build
```

### To remove all unused containers:
```shell script
docker system prune
```

### To remove all containers and cache in system:
```shell script
docker system -a prune
```