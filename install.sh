#!/bin/bash

if (( $EUID != 0 )); then
    printf "\033[0;33m<pterodactyl-region> \033[0;31m[✕]\033[0m Please run this programm as root \n"
    exit
fi

watermark="\033[0;33m<pterodactyl-region> \033[0;32m[✓]\033[0m"

startPterodactyl(){
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | sudo -E bash -
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    nvm install node || {
        printf "${watermark} nvm command not found, trying to source nvm script directly... \n"
        . ~/.nvm/nvm.sh
        nvm install node
    }
    apt update

    npm i -g yarn
    yarn
    export NODE_OPTIONS=--openssl-legacy-provider
    yarn build:production || {
        printf "${watermark} node: --openssl-legacy-provider is not allowed in NODE_OPTIONS \n"
        export NODE_OPTIONS=
        yarn build:production
    }
    sudo php artisan optimize:clear
}

installModule(){
    printf "${watermark} Installing module... \n"
    cd /var/www/pterodactyl
    rm -rvf pterodactyl-region
    printf "${watermark} Previous module succesfully removed \n"
    git clone https://github.com/Yarik1333Roky/pterodactyl-region.git
    printf "${watermark} Cloning git repository \n"
    rm -f resources/scripts/components/server/console/RegionStatBlock.tsx
    rm -f resources/scripts/components/server/console/ServerDetailsBlock.tsx
    rm -rvf resources/scripts/assets/regions
    printf "${watermark} Previous files succesfully removed \n"
    cd pterodactyl-region
    mv resources/regions /var/www/pterodactyl/resources/scripts/assets/
    mv resources/RegionStatBlock.tsx /var/www/pterodactyl/resources/scripts/components/server/console/
    mv resources/ServerDetailsBlock.tsx /var/www/pterodactyl/resources/scripts/components/server/console/
    printf "${watermark} New files succesfully installed \n"
    rm -rvf /var/www/pterodactyl/pterodactyl-region
    printf "${watermark} Git repository deleted \n"
    cd /var/www/pterodactyl
    
    printf "${watermark} Module fully and succesfully installed in your pterodactyl repository \n"

    while true; do
        read -p '<pterodactyl-region> [?] Do you want rebuild panel assets [y/N]? ' yn
        case $yn in
            [Yy]* ) startPterodactyl; break;;
            [Nn]* ) exit;;
            * ) exit;;
        esac
    done
}

while true; do
    read -p '<pterodactyl-region> [✓] Are you sure that you want to install "pterodactyl-regions" module [y/N]? ' yn
    case $yn in
        [Yy]* ) installModule; break;;
        [Nn]* ) printf "${watermark} Canceled \n"; exit;;
        * ) exit;;
    esac
done