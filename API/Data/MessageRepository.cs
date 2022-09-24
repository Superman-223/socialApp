using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interface;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public MessageRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public void AddGroup(Group group)
        {
            _context.Groups.Add(group);
        }

        public void AddMessage(Message message)
        {
            _context.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Connection> GetConnection(string connectionId)
        {
            return await _context.Connections.FindAsync(connectionId);
        }

        public async Task<Group> GetGroupForConnection(string connectionId)
        {
            return await _context.Groups.Include(c => c.Connections)
                .FirstOrDefaultAsync(c => c.Connections.Any(x => x.ConnectionId == connectionId));
        }

        public async Task<Message> GetMessage(int id)
        {
             return await _context.Messages
                .Include(u => u.Sender)
                .Include(u => u.Recipient)
                .SingleOrDefaultAsync(x=> x.Id == id);
        }

        public async Task<Group> GetMessageGroup(string groupName)
        {
            return await _context.Groups.Include(x => x.Connections).FirstOrDefaultAsync(x => x.Name == groupName);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = _context.Messages.OrderByDescending(m => m.MessageSent).ProjectTo<MessageDto>(_mapper.ConfigurationProvider).AsQueryable();

            query = messageParams.Container switch
            {
                "Inbox" => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecipientDeleted == false),
                "Outbox" => query.Where(u => u.SenderUsername == messageParams.Username && u.SenderDeleted == false),
                _ => query.Where(u => u.RecipientUsername == messageParams.Username &&  u.RecipientDeleted == false && u.DateRead == null)

            };

            return await PagedList<MessageDto>.CreateAsync(query, messageParams.PageNumber, messageParams.PageSize);

        }


        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername)
        {
            var messages = await _context.Messages
                //.Include(u => u.Sender).ThenInclude(p=>p.Photos)  => No need when using projection.
                //.Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(msg => msg.Recipient.UserName == currentUsername && msg.RecipientDeleted == false && msg.Sender.UserName == recipientUsername
                                                                || msg.Recipient.UserName == recipientUsername && msg.SenderDeleted == false && msg.Sender.UserName == currentUsername)
                                                                .OrderBy(msg => msg.MessageSent)
                                                                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                                                                .ToListAsync();
            var unreadMessages = messages.Where(msg => msg.DateRead == null &&
             msg.RecipientUsername == currentUsername).ToList();

            if (unreadMessages.Any())
            {
                foreach(var message in unreadMessages)
                {
                    message.DateRead = DateTime.UtcNow;
                }
               // await _context.SaveChangesAsync();
            }

            //return _mapper.Map<IEnumerable<MessageDto>>(messages);
            return messages;
        }

        public void RemoveConnection(Connection connection)
        {
            _context.Connections.Remove(connection);
        }
    }
}
