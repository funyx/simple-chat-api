module.exports = {
  // autosubscribe: ['destroy', 'update', 'add:users', 'remove:users'],
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
		room: {
      model: 'room',
      foreignKey: 'uid'
    },
    roomUid: 'string',
    uid: 'string',
    author: {
      model: 'user'
    },
		content: 'string'
  },
};
