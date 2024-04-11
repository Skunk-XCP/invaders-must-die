createRestartButton() {
    // Définir les dimensions et le style du bouton
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.cameras.main.centerX - buttonWidth / 2;
    const buttonY = this.cameras.main.centerY - buttonHeight / 2;

    // Créer le fond du bouton
    const buttonBackground = this.add
       .graphics()
       .fillStyle(0x000000, 0.5) // Couleur et transparence du fond
       .setInteractive(
          new Phaser.Geom.Rectangle(
             buttonX,
             buttonY,
             buttonWidth,
             buttonHeight
          ),
          Phaser.Geom.Rectangle.Contains
       )
       .fillRect(buttonX, buttonY, buttonWidth, buttonHeight)
       .lineStyle(2, 0xffffff) // Couleur et épaisseur du contour
       .strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Ajouter le texte du bouton
    this.add
       .text(
          this.cameras.main.centerX,
          this.cameras.main.centerY,
          "Restart",
          {
             fontSize: "20px",
             color: "#FFFFFF",
          }
       )
       .setOrigin(0.5);

    // Ajouter un événement de clic au fond du bouton pour redémarrer la scène
    buttonBackground.on("pointerdown", () => {
       this.scene.restart();
    });

    // Changer le curseur en pointeur lors du survol du bouton
    buttonBackground.on("pointerover", () => {
       this.input.setDefaultCursor("pointer");
    });

    // Revenir au curseur par défaut lorsqu'on quitte le bouton
    buttonBackground.on("pointerout", () => {
       this.input.setDefaultCursor("default");
    });
 }