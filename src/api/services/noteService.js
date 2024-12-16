const { Note, Tag, Note_Tag, sequelize } = require('../models/noteModel');
const { ulid } = require('ulid');

class NoteService {
    async createNote(userId, title, content, memoDate, tags) {
        try {
            const noteId = ulid();
            const note = await Note.create({
                id: noteId,
                user_id: userId,
                title,
                content,
                memo_date: memoDate,
                created_at: new Date(),
                updated_at: new Date()
            });

            if (tags && tags.length > 0) {
                for (const tagName of tags) {
                    let [tag] = await Tag.findOrCreate({
                        where: { name: tagName },
                        defaults: {
                            id: ulid(),
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });
                    await Note_Tag.create({
                        note_id: noteId,
                        tag_id: tag.id
                    });
                }
            }

            return await this.getNoteById(noteId, userId);
        } catch (error) {
            throw new Error('노트 생성 중 오류가 발생했습니다: ' + error.message);
        }
    }

    async getNotes(userId) {
        try {
            return await Note.findAll({
                where: { user_id: userId },
                include: [{
                    model: Tag,
                    through: { attributes: [] }
                }],
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new Error('노트 조회 중 오류가 발생했습니다: ' + error.message);
        }
    }

    async getNoteById(noteId, userId) {
        try {
            const note = await Note.findOne({
                where: { 
                    id: noteId,
                    user_id: userId
                },
                include: [{
                    model: Tag,
                    through: { attributes: [] }
                }]
            });
            if (!note) {
                throw new Error('노트를 찾을 수 없습니다.');
            }
            return note;
        } catch (error) {
            throw new Error('노트 조회 중 오류가 발생했습니다: ' + error.message);
        }
    }

    async updateNote(noteId, userId, title, content, memoDate, tags) {
        try {
            const note = await Note.findOne({
                where: { 
                    id: noteId,
                    user_id: userId
                }
            });

            if (!note) {
                throw new Error('노트를 찾을 수 없습니다.');
            }

            await note.update({
                title,
                content,
                memo_date: memoDate,
                updated_at: new Date()
            });

            if (tags) {
                await Note_Tag.destroy({
                    where: { note_id: noteId }
                });

                for (const tagName of tags) {
                    let [tag] = await Tag.findOrCreate({
                        where: { name: tagName },
                        defaults: {
                            id: ulid(),
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });
                    await Note_Tag.create({
                        note_id: noteId,
                        tag_id: tag.id
                    });
                }
            }

            return await this.getNoteById(noteId, userId);
        } catch (error) {
            throw new Error('노트 수정 중 오류가 발생했습니다: ' + error.message);
        }
    }

    async deleteNote(noteId, userId) {
        const t = await sequelize.transaction();
        
        try {
          const note = await Note.findOne({
            where: { id: noteId, user_id: userId },
            include: [{ model: Tag, through: { attributes: [] } }],
            transaction: t
          });
      
          if (!note) {
            throw new Error('노트를 찾을 수 없습니다.');
          }
      
          const tagIds = note.Tags.map(tag => tag.id);
      
          await Note_Tag.destroy({
            where: { note_id: noteId },
            transaction: t
          });
      
          await note.destroy({ transaction: t });
      
          for (const tagId of tagIds) {
            const tagUsageCount = await Note_Tag.count({
              where: { tag_id: tagId },
              transaction: t
            });
            
            if (tagUsageCount === 0) {
              await Tag.destroy({
                where: { id: tagId },
                transaction: t
              });
            }
          }
      
          await t.commit();
          return { message: '노트와 연관된 데이터가 삭제되었습니다.' };
        } catch (error) {
          await t.rollback();
          throw new Error('노트 삭제 중 오류가 발생했습니다: ' + error.message);
        }
      }
}

const noteService = new NoteService();

module.exports = noteService;
