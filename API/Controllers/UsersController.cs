using System.Collections.Generic;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interface;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseController
    {
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;


        public UsersController(IUserRepository userRepo, IMapper mapper)
        {
            _userRepo = userRepo;
            _mapper = mapper;

        }

        [HttpGet()]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
        {
          return Ok(await _userRepo.GetMembersAsync());
        }
         


        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetUsers(string  username)
        {
          return await _userRepo.GetMemberAsync(username); ;
        }


    }
}
