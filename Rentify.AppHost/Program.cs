var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.Rentify_Server>("rentify-server");

builder.Build().Run();
