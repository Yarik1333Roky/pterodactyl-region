#!/bin/bash

if (( $EUID != 0 )); then
    printf "\033[0;33m<pterodactyl-region> \033[0;31m[✕]\033[0m Please run this programm as root.\n"
    exit
fi

watermark="\033[0;33m<pterodactyl-region> \033[0;32m[✓]\033[0m"

startPterodactyl(){
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | sudo -E bash -
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    nvm install node || {
        printf "${watermark} nvm command not found, trying to source nvm script directly...\n"
        . ~/.nvm/nvm.sh
        nvm install node
    }
    apt update

    npm i -g yarn
    yarn
    export NODE_OPTIONS=--openssl-legacy-provider
    yarn build:production || {
        printf "${watermark} node: --openssl-legacy-provider is not allowed in NODE_OPTIONS\n"
        export NODE_OPTIONS=
        yarn build:production
    }
    sudo php artisan optimize:clear
}

installModule(){
    printf "${watermark} Installing module...\n"
    cd /var/www/pterodactyl
    rm -rvf pterodactyl-region
    printf "${watermark} Previous module succesfully removed\n"
    git clone https://github.com/Yarik1333Roky/pterodactyl-region.git
    printf "${watermark} Cloning git repository...\n"

    rm -f resources/scripts/components/server/console/RegionStatBlock.tsx
    rm -f resources/scripts/components/server/console/ServerDetailsBlock.tsx
    rm -f app/Http/Controllers/Admin/Settings/PterodactylRegionController.php
    rm -f app/Http/Requests/Admin/Settings/PterodactylRegionSettingsFormRequest.php
    rm -f resources/views/admin/settings/pterodactyl-region.blade.php
    rm -rvf resources/scripts/assets/regions
    rm -rvf resources/scripts/components/server/console/api-ip
    rm -rvf resources/scripts/components/server/console/api-dns
    sed -i "/'region-api:ip',/d" app/Providers/SettingsServiceProvider.php
    sed -i "/'region-api:dns',/d" app/Providers/SettingsServiceProvider.php
    sed -i "/<li @if(\$activeTab === 'pterodactyl-region')class=\"active\"@endif><a href=\"{{ route('admin.settings.pterodactyl-region') }}\">Pterodactyl Region<\/a><\/li>/d" nav.blade.php
    sed -i "\/pterodactyl-region/d" routes/admin.php
    sed -i "/region-api/d;/region_api/d;/],  /d" app/Http/ViewComposers/AssetComposer.php

    printf "${watermark} Previous files succesfully removed\n"
    cd pterodactyl-region

    sed -i "/],/a\\\t    'region_api' => [\n\t\t'ip' => config('region-api.ip') ?? 'ipapi.is',\n\t\t'dns' => config('region-api.dns') ?? 'DNS-Google',\n\t    ],  " /var/www/pterodactyl/app/Http/ViewComposers/AssetComposer.php
    sed -i "/->name('admin.settings.advanced');/a\\    Route::get('\/pterodactyl-region', [Admin\\\Settings\\\PterodactylRegionController::class, 'index'])->name('admin.settings.pterodactyl-region');" /var/www/pterodactyl/routes/admin.php
    sed -i "/Advanced<\/a><\/li>/a\\\t\t    <li @if(\$activeTab === 'pterodactyl-region')class=\"active\"@endif><a href=\"{{ route('admin.settings.pterodactyl-region') }}\">Pterodactyl Region</a></li>" /var/www/pterodactyl/resources/views/partials/admin/settings/nav.blade.php
    sed -i "/'pterodactyl:client_features:allocations:range_end'/a\\\t'region-api:ip',\n\t'region-api:dns'," /var/www/pterodactyl/app/Providers/SettingsServiceProvider.php
    mv resources/regions /var/www/pterodactyl/resources/scripts/assets/
    mv resources/api-ip /var/www/pterodactyl/resources/scripts/components/server/console/
    mv resources/api-dns /var/www/pterodactyl/resources/scripts/components/server/console/
    mv resources/RegionStatBlock.tsx /var/www/pterodactyl/resources/scripts/components/server/console/
    mv resources/ServerDetailsBlock.tsx /var/www/pterodactyl/resources/scripts/components/server/console/
    mv resources/PterodactylRegionController.php /var/www/pterodactyl/app/Http/Controllers/Admin/Settings/
    mv resources/PterodactylRegionSettingsFormRequest.php /var/www/pterodactyl/app/Http/Requests/Admin/Settings/
    mv resources/pterodactyl-region.blade.php /var/www/pterodactyl/resources/views/admin/settings

    printf "${watermark} New files succesfully installed\n"
    rm -rvf /var/www/pterodactyl/pterodactyl-region
    printf "${watermark} Git repository deleted\n"
    cd /var/www/pterodactyl
    
    printf "${watermark} Module fully and succesfully installed in your pterodactyl repository\n"

    while true; do
        read -p '<pterodactyl-region> [?] Do you want to rebuild panel assets [y/N]? ' yn
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
        [Nn]* ) printf "${watermark} Canceled\n"; exit;;
        * ) exit;;
    esac
done