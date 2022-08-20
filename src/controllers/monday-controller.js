const { response } = require('express');
const mondayService = require('../services/monday-service');
const speciesService = require('../services/species-service');

async function executeAction(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const { boardId, itemId, sourceColumnId, targetColumnId } = inputFields;

    const text = await mondayService.getColumnValue(shortLivedToken, itemId, sourceColumnId);
    if (!text) {
      return res.status(200).send({});
    }

    const availableSpecies = await speciesService.searchSpecies(text);

    console.log("board id:" + boardId + ",item id: " + itemId + ", target column id:" + targetColumnId)

    await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, targetColumnId, availableSpecies);

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}


async function save_species(req, res) {
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {
    const { inputFields } = payload;
    const { groupId, itemId} = inputFields;

    console.log("approved groupId:" + groupId +  " itemId:" + itemId)

    const rowResp = await mondayService.getRowValues(shortLivedToken, itemId);
    const userEmailResp = await mondayService.getEmail(shortLivedToken);

    const researcher_email = userEmailResp.data.me.email;
    const colValues = rowResp[0].column_values;

    const location = colValues.filter(function(data){
       return data.id == "location"
    });

    const approvedSpecies = colValues.filter(function(data){
      return data.id.includes('dropdown') && data.text.includes('#')
    });

    const finding_date = colValues.filter(function(data){
      return data.id.includes('creation_log')
    });

    const species_id = String(approvedSpecies[0].text).split("#")[0];

    const record_to_save = {
      finding_date: "2022-07-30T14:20:00",
      location: location[0].text,
      species_id: species_id,
      researcher_email: researcher_email
    }

    console.log("Record to save:" , JSON.stringify(record_to_save));

    await speciesService.saveFinding(record_to_save);

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}


/*
async function getRemoteListOptions(req, res) {
  try {
    return res.status(200).send(TRANSFORMATION_TYPES);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}
*/

module.exports = {
  executeAction,
  save_species,
};
