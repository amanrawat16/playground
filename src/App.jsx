
import { Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AddTeam from "./pages/AddTeam";
import AddPlayer from "./pages/AddPlayer";
import ViewMatches from "./pages/Matches/V2/ViewMatchesV2";
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
import TournamentHub from "./pages/TournamentHub";
import CreateTournament from "./pages/CreateTournament";
import TournamentDetail from "./pages/TournamentDetail";
import TournamentTeams from "./pages/TournamentTeams";
import TournamentGroups from "./pages/TournamentGroups";
import TournamentMatches from "./pages/TournamentMatches";
import TournamentStandings from "./pages/TournamentStandings";
import { ViewPlayers } from "./pages/Teams/ViewPlayers";
import PlayerProfile from "./pages/Teams/PlayerProfile";
import MyMatches from "./pages/Matches/MyMatches";
import ViewTeams from "./pages/Teams/ViewTeams";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import AddStaff from "./pages/AddStaff";
import InviteTeam from "./pages/InviteTeam";
import InviteClub from "./pages/InviteClub";
import V2TournamentPlayerLeaderboard from "./pages/V2TournamentPlayerLeaderboard";
import MatchSummaryPage from "./pages/MatchSummary/MatchSummaryPage";
import TeamSummaryPage from "./pages/TeamSummary/TeamSummaryPage";

// -----------------------------------------------------------------
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/invite/team/:teamId" element={<InviteTeam />} />
      <Route path="/invite/club/:clubId" element={<InviteClub />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Admin />} />
        <Route path="addTeam" element={<AddTeam />} />
        <Route path="viewTeams" element={<ViewTeams />} />
        <Route path="addPlayer" element={<AddPlayer />} />
        <Route path="viewPlayers" element={<ViewPlayers />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/viewMatches" element={<ViewMatches />} />
        <Route path="myMatches" element={<MyMatches />} />
        <Route path="viewMatches/:leagueId" element={<ViewMatches />} />
        <Route path="createMatch" element={<CreateMatch />} />
        <Route path="updatePlayerSummary" element={<PlayerSummary />} />
        <Route path="playerSummary" element={<PlayerSummary />} />
        <Route path="playerSummary/:playerId/:matchId" element={<PlayerSummary />} />
        <Route path="team/:teamId/player/:playerId/updatePlayerDetail" element={<UpdatePlayerDetails />} />
        <Route path="updatePlayerDetails/:playerId/:matchId" element={<UpdatePlayerDetails />} />
        <Route path="match/:matchId/updateMatchSummary" element={<UpdateMatchSummary />} />
        <Route path="updateMatch/:matchId" element={<UpdateMatchSummary />} />
        <Route path="users" element={<Users />} />
        <Route path="home" element={<Home />} />
        <Route path="playerProfile/:playerId" element={<PlayerProfile />} />
        <Route path="summary" element={<Summary />} />

        {/* New Tournament Routes using V2 API */}
        <Route path="tournaments" element={<TournamentHub />} />
        <Route path="tournaments/create" element={<CreateTournament />} />
        <Route path="tournaments/:id" element={<TournamentDetail />} />
        <Route path="tournaments/:id/teams" element={<TournamentTeams />} />
        <Route path="tournaments/:id/groups" element={<TournamentGroups />} />
        <Route path="test-groups" element={<TournamentGroups />} />
        <Route path="tournaments/:id/matches" element={<TournamentMatches />} />
        <Route path="tournaments/:id/standings" element={<TournamentStandings />} />
        <Route path="tournaments/:id/players" element={<V2TournamentPlayerLeaderboard />} />
        <Route path="addStaff" element={<AddStaff />} />

        {/* Match Summary standalone page */}
        <Route path="matchSummary/:matchId" element={<MatchSummaryPage />} />

        {/* Team Summary standalone page */}
        <Route path="teamSummary/:tournamentId/:teamId" element={<TeamSummaryPage />} />

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
