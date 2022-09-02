﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interface;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        public UserRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        private readonly DataContext _context;
        private readonly IMapper _mapper;


        public void Update(AppUser user) =>

            _context.Entry(user).State = EntityState.Modified;
    
        public async Task<bool> SaveAllAsync() => await _context.SaveChangesAsync() > 0;
        

        public async Task<IEnumerable<AppUser>> GetUsersAsync() => await _context.Users.Include(x=>x.Photos).ToListAsync();
        

        public async Task<AppUser> GetUserByIdAsync(int id) => await _context.Users.FindAsync(id);
        

        public async Task<AppUser> GetUserByUsernameAsync(string username) => await _context.Users.Include(x => x.Photos).SingleOrDefaultAsync(x=> x.Username == username);

        public  async Task<IEnumerable<MemberDto>> GetMembersAsync()
        {
            return await _context.Users.ProjectTo<MemberDto>(_mapper.ConfigurationProvider).ToListAsync();
        }

        public async Task<MemberDto> GetMemberAsync(string username)
        {
            return await _context.Users.Where(x => x.Username == username).ProjectTo<MemberDto>(_mapper.ConfigurationProvider).SingleOrDefaultAsync();

        }
    }
}
