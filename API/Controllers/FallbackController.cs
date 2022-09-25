using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class FallbackController : Controller
    {

        // responsible fgor loading our Angulr App
        public ActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "index.html"), "text/HTML");
        }
    }
}
