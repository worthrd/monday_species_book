const initMondayClient = require('monday-sdk-js');
const { faker } = require('@faker-js/faker');

const getColumnValue = async (token, itemId, columnId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `query($itemId: [Int], $columnId: [String]) {
        items (ids: $itemId) {
          column_values(ids:$columnId) {
            value
          }
        }
      }`;
    const variables = { columnId, itemId };

    const response = await mondayClient.api(query, { variables });
    return response.data.items[0].column_values[0].value;
  } catch (err) {
    console.error(err);
  }
};

const getColumnText = async (token, itemId, columnId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    console.log("getColumnText columnId:" + columnId + " itemId:"+ itemId);

    const query = `query($itemId: [Int], $columnId: [String]) {
        items (ids: $itemId) {
          column_values(ids:$columnId) {
            text
          }
        }
      }`;
    const variables = { columnId, itemId };

    const response = await mondayClient.api(query, { variables });
    console.log("get history graphql resul:",JSON.stringify(response.data))
    return response.data.items[0].column_values[0].text;
  } catch (err) {
    console.error(err);
  }
};

const getRowValues = async (token, itemId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `query($itemId: [Int]) {
        items (ids: $itemId) {
          column_values {
            id,
            text,
            description,
            value
          }
        }
      }`;
    const variables = { itemId };

    const response = await mondayClient.api(query, { variables });
    return response.data.items;
  } catch (err) {
    console.error(err);
  }
};

const getEmail = async (token) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `query {
        me {
          email
        }
      }`;

    const response = await mondayClient.api(query);
    return response;
  } catch (err) {
    console.error(err);
  }
};


const changeColumnValue = async (token, boardId, itemId, columnId, value) => {
  try {
    const mondayClient = initMondayClient({ token });

    const query = `mutation change_column_value($boardId: Int!, $itemId: Int!, $columnId: String!, $value: JSON!) {
        change_column_value(board_id: $boardId, item_id: $itemId, column_id: $columnId, value: $value) {
          id
        }
      }
      `;
    const sending_value = "{ \"" + columnId + "\": " + value + " }"
    const query2 = `mutation change_multiple_column_values($boardId: Int!, $itemId: Int!) {
        change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: ${JSON.stringify(sending_value)}, create_labels_if_missing: true) {
          id
        }
      }
      `;
    console.log("query: " + query2)
    const variables = { boardId, columnId, itemId, value };

    const response = await mondayClient.api(query2, { variables });

    console.log("response:" + JSON.stringify(response));
    return response;
  } catch (err) {
    console.error(err);
  }
};


const fillGroupWithSpecies = async (token, boardId, groupId , recordedSpecies) => {
  try {
    const mondayClient = initMondayClient({ token });

    const query = `mutation create_item($boardId: Int!, $groupId: String!, $itemName: String!){  
        create_item (board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: ${recordedSpecies}, create_labels_if_missing: true){
          id
        }
    }
    `;
    console.log("query of create history item: " + query)

    const itemName = faker.random.alphaNumeric(10)
    const variables = { boardId, groupId ,itemName ,recordedSpecies};
    const response = await mondayClient.api(query, { variables });

    console.log("response create history:" + JSON.stringify(response));
    return response;
  } catch (err) {
    console.error(err);
  }
};


module.exports = {
  getColumnValue,
  changeColumnValue,
  getRowValues,
  getEmail,
  getColumnText,
  fillGroupWithSpecies
};
