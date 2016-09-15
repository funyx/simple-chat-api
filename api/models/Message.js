module.exports = {
  // autosubscribe: ['destroy', 'update', 'add:users', 'remove:users'],
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
		roomUid: {
      model: 'room',
      foreignKey: 'uid'
    },
    uid: 'string',
    author: {
      model: 'user'
    },
		content: 'string'
  },
};
