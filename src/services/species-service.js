const axios = require('axios').default;
const url = require("url");


const searchSpecies = async (value) => {
  try {
    value = value.toString().replace(/['"]+/g, '')

    if(value.length<5)
      return "{\"labels\": []}";

    const queryParams = {
      name: value
    };
    const params = new url.URLSearchParams(queryParams);
    console.log(params);
    const resProm = await axios.get(`http://46.101.229.249:5000/search?${params}`);
    const response = await resProm.data;

    console.log("species api response:" + JSON.stringify(response));
    let species = [];


    response.result.forEach(element => {
       species.push("\"" + element.id + "#" + element.scientificname + "\"");
    });


    return "{\"labels\": ["+species+"]}";
    
  } catch (err) {
    console.error(err);
  }
};


const saveFinding = async (approvedSpecies) => {
  try {
  
    const response = await axios.post("http://46.101.229.249:5000/record_species",approvedSpecies);

    console.log("save findings result:", response);
    
    return response;

  } catch (err) {
    console.error(err);
  }
};
  
module.exports = { searchSpecies,saveFinding };