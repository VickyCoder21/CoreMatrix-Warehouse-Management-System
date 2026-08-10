using System.Runtime.CompilerServices;
namespace FastEndpoints.OpenApi;
internal static class OpenApiExportPathInitializer
{
    [ModuleInitializer]
    internal static void Initialize() => DocumentOptions.OpenApiExportPath = "wwwroot/openapi";
}
