import axios from "axios"

export const getTokenPrice = async (req, res) => {
  try {
    const id = req.params.id;
    const token_data = await axios.get(`https://api.pancakeswap.info/api/v2/tokens/${id}`)
      .then((data) => {
       return data.data.data.price;
      }).catch((err) => {
        return "no token";
      });
      console.log("token_data", token_data);
      return token_data;
  } catch(err) {
    const message = error.toString();
    return res.status(400).json({ error: message });
  }
}
