FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TaskFlow.Api.csproj ./
RUN dotnet restore TaskFlow.Api.csproj

COPY . ./
RUN dotnet publish TaskFlow.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

RUN mkdir -p /app/App_Data

COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "TaskFlow.Api.dll"]
