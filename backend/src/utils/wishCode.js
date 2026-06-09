const { customAlphabet } = require("nanoid");
const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);
function generateWishCode() {
  return `HW-${new Date().getFullYear()}-${nano()}`;
}
module.exports = { generateWishCode };
