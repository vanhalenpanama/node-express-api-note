const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Note 모델 정의
const Note = sequelize.define(
  'Note',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    user_id: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    memo_date: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { tableName: 'Note', timestamps: false }
);

// Tag 모델 정의
const Tag = sequelize.define(
  'Tag',
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { tableName: 'Tag', timestamps: false }
);

// Note-Tag 관계 모델 정의
const Note_Tag = sequelize.define(
  'Note_Tag',
  {
    note_id: {
      type: DataTypes.STRING,
      references: {
        model: Note,
        key: 'id'
      }
    },
    tag_id: {
      type: DataTypes.STRING,
      references: {
        model: Tag,
        key: 'id'
      }
    }
  },
  {
    tableName: 'Note_Tag',
    timestamps: false,
    underscored: true
  }
);

// 관계 설정
Note.belongsToMany(Tag, {
  through: {
    model: Note_Tag,
    timestamps: false
  },
  foreignKey: 'note_id',
  otherKey: 'tag_id'
});

Tag.belongsToMany(Note, {
  through: {
    model: Note_Tag,
    timestamps: false
  },
  foreignKey: 'tag_id',
  otherKey: 'note_id'
});

// 모델들 내보내기
module.exports = {
  Note,
  Tag,
  Note_Tag,
  sequelize
};