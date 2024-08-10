
import { Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AddTeam from "./pages/AddTeam";
import AddPlayer from "./pages/AddPlayer";
import ViewMatches from "./pages/Matches/ViewMatches";
import Matches from "./pages/Matches/Matches";
import CreateMatch from "./pages/Matches/CreateMatch";
import Blog1 from "./pages/Blog1";
import Blog2 from "./pages/Blog2";
import Blog3 from "./pages/Blog3";
import "./App.css";
import PlayerSummary from "./pages/Matches/PlayerSummary";
import UpdatePlayerDetails from "./pages/Matches/UpdatePlayerDetails";
import Users from "./pages/Users";
import UpdateMatchSummary from "./pages/Matches/UpdateMatchSummary";
import LeagueWiseTournamentSummary from "./pages/Tournaments-Summary/LeagueWiseTournamentSummary";
import MatchWiseTournamentSummary from "./pages/Tournaments-Summary/MatchWiseTournamentSummary";
import Tournament from "./pages/Tournaments-Summary/Tournament";
import LeagueTeamWiseTournamentSummary from "./pages/Tournaments-Summary/LeagueTeamWiseTournamentSummary";
import LeagueMatchSummary from "./pages/Tournaments-Summary/LeagueMatchSummary";
import StartLeague from "./pages/StartLeague";
import { ViewPlayers } from "./pages/Teams/ViewPlayers";
import PlayerProfile from "./pages/Teams/PlayerProfile";
import MyMatches from "./pages/Matches/MyMatches";
import ViewTeams from "./pages/Teams/ViewTeams";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import AddStaff from "./pages/AddStaff";

// -----------------------------------------------------------------
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Admin />} />
        <Route path="updateTeam" element={<AddPlayer />} />
        <Route path="addTeam" element={<AddTeam />} />
        <Route path="addStaff" element={<AddStaff />} />
        <Route path="updateUsers" element={<Users />} />
        <Route path="startLeague" element={<StartLeague />} />
        <Route
          path="match/:matchId/updateMatchSummary"
          element={<UpdateMatchSummary />}
        />
        <Route path="updatePlayerSummary" element={<PlayerSummary />} />
        <Route
          path="team/:teamid/player/:playerid/updatePlayerDetail"
          element={<UpdatePlayerDetails />}
        />
        <Route path="/dashboard/matches" element={<Matches />}>
          <Route path="viewMatches" element={<ViewMatches />} />
          <Route path="createMatch" element={<CreateMatch />} />
          <Route path="myMatches" element={<MyMatches />} />
        </Route>
        <Route path="/dashboard/tournamentSummary" element={<Tournament />}>
          <Route index element={<Tournament />} />
          <Route path="leagueWise" element={<LeagueWiseTournamentSummary />} />
          <Route path="matchWise" element={<MatchWiseTournamentSummary />} />

          <Route
            path="leagueTeamWise"
            element={<LeagueTeamWiseTournamentSummary />}
          />
          <Route path="leagueMatchSummary" element={<LeagueMatchSummary />} />
        </Route>
        <Route path="/dashboard/ViewPlayers" element={<ViewPlayers />} />
        <Route path="/dashboard/Teams" element={<ViewTeams />} />
        <Route path="/dashboard/playerProfile/:playerId" element={<PlayerProfile />} />
      </Route>

      <Route path="/blog1" element={<Layout />}>
        <Route index element={<Blog1 />} />
      </Route>

      <Route path="/blog2" element={<Layout />}>
        <Route index element={<Blog2 />} />
      </Route>

      <Route path="/blog3" element={<Layout />}>
        <Route index element={<Blog3 />} />
      </Route>
    </Routes>
  );
};

export default App;
