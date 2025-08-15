#!/bin/bash

if [[ "$EUID" -ne 0 ]]; then
    printf "\033[0;33m<pterodactyl-region>\033[0;31m [✕] \033[0m Please run this program as root.\n"
    exit
fi

echo ""
echo "pterodactyl-region"
echo "Show where your server located across the world."
echo "version: 1.0.0"
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