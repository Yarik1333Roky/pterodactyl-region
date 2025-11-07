#!/bin/bash

if [[ "$EUID" -ne 0 ]]; then
    printf "\033[0;33m<pterodactyl-region>\033[0;31m [✕] \033[0m Please run this program as root.\n"
    exit
fi

echo ""
echo """
           __                      __           __        __                      _           
    ____  / /____  _________  ____/ /___ ______/ /___  __/ /     ________  ____ _(_)___  ____ 
   / __ \/ __/ _ \/ ___/ __ \/ __  / __ `/ ___/ __/ / / / /_____/ ___/ _ \/ __ `/ / __ \/ __ \
  / /_/ / /_/  __/ /  / /_/ / /_/ / /_/ / /__/ /_/ /_/ / /_____/ /  /  __/ /_/ / / /_/ / / / /
 / .___/\__/\___/_/   \____/\__,_/\__,_/\___/\__/\__, /_/     /_/   \___/\__, /_/\____/_/ /_/ 
/_/                                             /____/                  /____/                
"""
echo "Show where your server located across the world."
echo "version: 2.0"
echo ""
echo "Copyright (c) 2025 exeyarikus"
echo "This program is free software; you can redistribute it and/or modify it."
echo ""
echo "Discord: https://dsc.gg/mrlg"
echo "Website: https://exeyarikus.info/"
echo ""
echo "[1] Install module"
echo "[2] Delete module"
echo "[3] Exit"
echo ""

read -p "<pterodactyl-region> [?] Please enter a number: " choice

if [[ $choice == "1" ]]; then
    sudo bash ./install.sh
elif [[ $choice == "2" ]]; then
    sudo bash ./delete.sh
elif [[ $choice == "3" ]]; then
    exit
fi