const getPurchaseTemplate = (buyerName, artworkTitle, totalAmount) => `
  <div style="font-family: serif; background-color: #FDFBF7; padding: 30px; color: #3D2B1F; max-width: 600px; border: 1px solid #8A9A5B20;">
    <h2 style="color: #3D2B1F; font-size: 24px; border-b: 2px solid #8A9A5B; padding-bottom: 10px;">ArtHub Marketplace Purchase</h2>
    <p>Greetings <strong>${buyerName}</strong>,</p>
    <p>Thank you for supporting independent creators. Your transaction for the fine artwork titled <strong>"${artworkTitle}"</strong> was processed seamlessly.</p>
    <div style="background-color: #8A9A5B10; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Item:</strong> ${artworkTitle}</p>
      <p style="margin: 5px 0;"><strong>Settled Sum:</strong> $${totalAmount} USD</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> Completed (Stripe Escrow Verified)</p>
    </div>
    <p style="font-size: 12px; color: #3D2B1F80;">This is a simulated deployment verification link notification run by Node/Nodemailer.</p>
  </div>
`;