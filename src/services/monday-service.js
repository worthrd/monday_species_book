const initMondayClient = require('monday-sdk-js');

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

const getRowValues = async (token, itemId) => {
  try {
    const mondayClient = initMondayClient();
    mondayClient.setToken(token);

    const query = `query($itemId: [Int]) {
        items (ids: $itemId) {
          column_values {
            id,
            text
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

module.exports = {
  getColumnValue,
  changeColumnValue,
  getRowValues,
  getEmail
};
