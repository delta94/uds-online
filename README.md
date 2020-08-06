# Undostres Project
This project consists of 2 frontend parts (public and admin) and API.

### Stack
* React
* Redux
* Typescript
* Golang
* MySQL
* Docker

### Requirements
* Ubuntu 18+
* Docker Engine, Docker-Compose

### Before starting the app:
* It is recommended to clone the repository to a folder in 
home directory.
* Copy `/default.env` file as `/.env`
* Configure the environment by the mentioned above `.env` file
* Copy `nginx/nginx._conf` file as `nginx/nginx.conf`. Configure it.
* Let's Encrypt: configure `letsencrypt.sh` by editing it and entering 
your email and domains. To debug it, use staging option (see the file's 
contents). Make sure that you commented out the SSL parts of nginx config, inlucding
redirects in HTTP parts of the config file.
When ready, launch the script:
```shell script
sudo bash letsencrypt.sh
```
Once Letsencrypt finishes its job, restore the commented parts mentioned above.

### Mailgun Configuration:
Visit `https://app.mailgun.com/app/account/security/api_keys` to get API keys for sending mail via Mailgun.
Do not forget to set MX records and other stuff for your domain.

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