const GOLD_DISCOUNT = 0.2;    // diskon 20%
const SILVER_DISCOUNT = 0.1;  // diskon 10%

function calculateDiscountedPrice(price, membershipTier) {
  switch (membershipTier) {
    case 'GOLD':
      return price * (1 - GOLD_DISCOUNT);
    case 'SILVER':
      return price * (1 - SILVER_DISCOUNT);
    default:
      return price;
  }
}

//p adalah harga
//t adalah tipe
//membership tier = tipe membership
//pakai switch karena yang di cek cuman 1 yaitu tipe member yang dimana itu pilih antara gold atau silver