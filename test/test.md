  ---
  template: feuille-presence
  landscape: true
  ---

  # Feuille de présence

  | | |
  |:--|:--|
  | **Intitulé** | {{type_formation}} |
  | **Date** | {{date}} |
  | **Lieu** | {{lieu}} |
  | **Durée** | {{duree}} |
  | **Formateur** | {{formateur}} |

  | **N°** | **NOM Prénom** | **Entreprise** | **Matin** | **Après-midi** | **Signature** |
  |:---:|:---|:---|:---:|:---:|:---|
  {{#each participants}}
  | {{num}} | {{nom_prenom}} | {{entreprise}} | | | |
  {{/each}}