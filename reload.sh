#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔄 Rechargement de mdpdf...${NC}\n"

# Unlink avec le nom explicite
echo -e "${YELLOW}📤 Suppression du lien global...${NC}"
sudo npm unlink -g mdpdf 2>/dev/null || echo "Pas de lien npm existant"

# Supprimer manuellement le lien symbolique s'il existe encore
if [ -L "/usr/local/bin/mdpdf" ]; then
    echo -e "${YELLOW}🗑️  Suppression manuelle du lien symbolique...${NC}"
    rm -f /usr/local/bin/mdpdf
fi

# Recréer le lien
echo -e "${YELLOW}📥 Création du nouveau lien global...${NC}"
sudo npm link

# Vérification
echo -e "\n${YELLOW}🔍 Vérification...${NC}"
which mdpdf

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ mdpdf rechargé avec succès !${NC}"
    
    # Test optionnel
    if [ "$1" == "--test" ]; then
        echo -e "\n${BLUE}🧪 Test de la commande...${NC}"
        mdpdf --help
    fi
else
    echo -e "\n${RED}❌ Erreur lors du rechargement${NC}\n"
    exit 1
fi