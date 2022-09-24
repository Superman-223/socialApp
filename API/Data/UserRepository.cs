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
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public UserRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public void Update(AppUser user) =>

            _context.Entry(user).State = EntityState.Modified;
           

        public async Task<IEnumerable<AppUser>> GetUsersAsync() => await _context.Users.Include(x=>x.Photos).ToListAsync();
        

        public async Task<AppUser> GetUserByIdAsync(int id) => await _context.Users.FindAsync(id);
        

        public async Task<AppUser> GetUserByUsernameAsync(string username) => await _context.Users.Include(x => x.Photos).SingleOrDefaultAsync(x=> x.UserName == username);

        public  async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParam)
        {
            var query = _context.Users.AsQueryable();
            query = query.Where(user => user.UserName != userParam.CurrentUsername);
            query = query.Where(user => user.Gender == userParam.Gender);

            var minDob = DateTime.Today.AddYears(-userParam.MaxAge - 1);
            var maxDob = DateTime.Today.AddYears(-userParam.MinAge);

            query = query.Where(user => user.DateOfBirth >= minDob && user.DateOfBirth <= maxDob);

            query = userParam.OrderBy switch
            {
                "created" => query.OrderByDescending(u => u.created),
                _ => query.OrderByDescending(u => u.LastActive)

            };

            var queryToProject = query.ProjectTo<MemberDto>(_mapper.ConfigurationProvider).AsNoTracking();

            return await PagedList<MemberDto>.CreateAsync(queryToProject, userParam.PageNumber, userParam.PageSize);
        }

        public async Task<MemberDto> GetMemberAsync(string username)
        {
            return await _context.Users.Where(x => x.UserName == username).ProjectTo<MemberDto>(_mapper.ConfigurationProvider).SingleOrDefaultAsync();

        }

        public async Task<string> GetUserGender(string username)
        {
            return await _context.Users
                .Where(x => x.UserName == username)
                .Select(x => x.Gender).FirstOrDefaultAsync();
        }
    }
}
