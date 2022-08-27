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

    const availableSpecies = await speciesService.searchSpecies(text);

    console.log("board id:" + boardId + ",item id: " + itemId + ", target column id:" + targetColumnId)

    await mondayService.changeColumnValue(shortLivedToken, boardId, itemId, targetColumnId, availableSpecies);

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}

function right(str, chr) {
  return str.slice(str.length-chr,str.length);
}
 
function left(str, chr) {
  return str.slice(0, chr - str.length);
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
       return String(data.description).toLowerCase() == "location"
    });

    const approvedSpecies = colValues.filter(function(data){
      return String(data.description).toLowerCase() == "species"
    });

    const findingDate = colValues.filter(function(data){
      return String(data.description).toLowerCase() == "date"
    });

    const notes = colValues.filter(function(data){
      return String(data.description).toLowerCase() == "notes"
    });

    const d = new Date(findingDate[0].text);
    console.log("date value:"+ findingDate[0].text);
    const f_finding_date = 
    `${d.getFullYear()}-${right("00"+d.getMonth(),2)}-${right("00"+d.getDay(),2)}T${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

    console.log("formatted date:", f_finding_date);

    const species_id = String(approvedSpecies[0].text).split("#")[0];

    const record_to_save = {
      finding_date: f_finding_date,
      location: location[0].value,
      species_id: species_id,
      researcher_email: researcher_email,
      notes: notes[0].text
    }

    console.log("Record to save:" , JSON.stringify(record_to_save));

    await speciesService.saveFinding(record_to_save);

    return res.status(200).send({});
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: 'internal server error' });
  }
}


async function get_history(req, res){
  const { shortLivedToken } = req.session;
  const { payload } = req.body;

  try {

    console.log("payload:"+  JSON.stringify(payload));
    const { inputFields } = payload;
    const { boardId, groupId, columnId, itemId } = inputFields;

    const species = await mondayService.getColumnText(shortLivedToken, itemId, columnId);
    console.log("selected species id for history:",species)
    
    const species_id = species.split("#")[0]
    const recordedSpecies = await speciesService.getRecordedSpecies(species_id);
    console.log("recoreded species parsed:",recordedSpecies)

    const rowResp = await mondayService.getRowValues(shortLivedToken, itemId);
    //console.log("row values:" + JSON.stringify(rowResp));
    const colValues = rowResp[0].column_values;
    //console.log("column values:" + JSON.stringify(colValues));

    let locationId, researcherId, dateId, noteId = null;
    
    speciesId = colValues.filter(function(data){
      return String(data.description).toLowerCase()  == "species";
    });

    locationId = colValues.filter(function(data){
      return String(data.description).toLowerCase()  == "location";
    });

    researcherId = colValues.filter(function(data){
      return String(data.description).toLowerCase()  == "researcher";
    });

    noteId = colValues.filter(function(data){
      return String(data.description).toLowerCase()  == "notes";
    });

    dateId = colValues.filter(function(data){
      return String(data.description).toLowerCase()  == "date";
    });

   
    for (let index = 0; index < recordedSpecies.length; index++) {
      const element = recordedSpecies[index];

      let mutation = "\"{";
     
      /*
      console.log(JSON.stringify(locationId));
      console.log(JSON.stringify(researcherId));
      console.log(JSON.stringify(dateId));
      console.log(JSON.stringify(noteId));
      */
     
      
      
      mutation += "\\\""+locationId[0]['id']+"\\\": "+String(element.location).replace(/"/g,"\\\"")+",";
      mutation += "\\\""+researcherId[0]['id']+"\\\": \\\""+element.researcheremail+"\\\",";
      mutation += "\\\""+dateId[0]['id']+"\\\": \\\""+element.findingdate+"\\\",";
      mutation += "\\\""+noteId[0]['id']+"\\\": \\\""+element.notes+"\\\",";
      mutation += "\\\""+speciesId[0]['id']+"\\\": \\\""+species+"\\\",";

      mutation = mutation.slice(0, -1);
      mutation += "}\"";
      
      console.log("mutation literal:" + mutation);
      

      /*
      let mutation = {};

      mutation[locationId[0]['id']] = element.location;
      mutation[researcherId[0]['id']] = element.researcheremail;
      mutation[dateId[0]['id']] = element.findingdate;
      mutation[noteId[0]['id']] = element.notes;

      let mutationString = JSON.stringify(mutation);
      const subIndex1 = mutationString.indexOf("lat") - 3;
      mutationString = mutationString.substring(0, subIndex1-1)+mutationString.substring(subIndex1, mutationString.length);
      const subIndex2 = mutationString.indexOf("\",\"")+1;
      mutationString = mutationString.substring(0, subIndex2-1)+mutationString.substring(subIndex2, mutationString.length);
      console.log("mutation literal:" + mutationString);
      */

      await mondayService.fillGroupWithSpecies(shortLivedToken, boardId, groupId, mutation);
      
    }
    
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
  get_history
};
