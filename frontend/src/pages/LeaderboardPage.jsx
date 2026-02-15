import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API, useAuth } from '../App';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trophy, Medal, RefreshCw, Loader2, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTid, setSelectedTid] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedStandings, setExpandedStandings] = useState(false);

  useEffect(() => {
    axios.get(`${API}/tournaments`).then(r => {
      setTournaments(r.data);
      const active = r.data.find(t => t.status === 'prices_set' || t.status === 'completed');
      if (active) setSelectedTid(active.id);
      else if (r.data.length > 0) setSelectedTid(r.data[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    if (!selectedTid) return;
    try {
      const r = await axios.get(`${API}/leaderboard/${selectedTid}`);
      setData(r.data);
    } catch { setData(null); }
  }, [selectedTid]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  useEffect(() => {
    if (!data || !selectedTid) return;
    const t = tournaments.find(x => x.id === selectedTid);
    if (!t || t.status === 'completed') return;
    if (t.start_date) {
      try {
        const now = new Date();
        const start = new Date(t.start_date);
        const end = t.end_date ? new Date(t.end_date) : new Date(start.getTime() + 4 * 86400000);
        if (now >= start && now <= end) {
          const interval = setInterval(fetchLeaderboard, 300000);
          return () => clearInterval(interval);
        }
      } catch {}
    }
  }, [data, selectedTid, tournaments, fetchLeaderboard]);

  const handleRefresh = async () => {
    if (!selectedTid || !user) return;
    setRefreshing(true);
    try {
      await axios.post(`${API}/scores/refresh/${selectedTid}?user_id=${user.id}`);
      await fetchLeaderboard();
    } catch (e) {
      console.error('Refresh failed:', e);
    }
    setRefreshing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-[#1B4332] animate-spin" /></div>;

  const standings = data?.team_standings || [];
  const allScores = data?.tournament_standings || [];
  const finalized = data?.is_finalized;
  const winners = finalized ? standings.slice(0, 3) : [];

  // Helper to render rounds with CUT handling
  const renderRounds = (golfer) => {
    const rounds = golfer.rounds || [];
    const isCut = golfer.is_cut;
    const maxRounds = 4;
    
    return Array.from({ length: maxRounds }, (_, ri) => {
      const round = rounds[ri];
      const hasScore = round && round.score && round.score !== '-' && round.score !== '';
      
      if (isCut && ri >= 2) {
        return (
          <span key={ri} className="w-8 text-center font-numbers text-[10px] text-red-400 font-bold">
            CUT
          </span>
        );
      }
      
      if (hasScore) {
        const isCurrentRound = golfer.is_active && ri === rounds.length - 1;
        return (
          <span key={ri} className={`w-8 text-center font-numbers ${isCurrentRound ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
            {round.score}
          </span>
        );
      }
      
      return (
        <span key={ri} className="w-8 text-center font-numbers text-slate-300">
          -
        </span>
      );
    });
  };

  // Helper to render Thru indicator - only show meaningful status
  const renderThru = (golfer) => {
    if (golfer.is_cut) return <span className="w-14"></span>;
    
    const thru = golfer.thru?.toString() || '';
    
    // If player is actively playing and has thru data
    if (golfer.is_active && thru && thru !== '18' && thru !== 'F') {
      return (
        <span className="w-14 text-center text-[10px] font-bold text-green-600 bg-green-50 rounded px-1 py-0.5">
          Thru {thru}
        </span>
      );
    } 
    
    // If player is active but no thru (just started or data not available)
    if (golfer.is_active && !thru) {
      return (
        <span className="w-14 text-center text-[10px] font-bold text-green-600 bg-green-50 rounded px-1 py-0.5">
          Playing
        </span>
      );
    }
    
    // Don't show anything if player isn't active - they're between rounds
    return <span className="w-14"></span>;
  };

  const TournamentStandingsBox = ({ isMobile }) => {
    // Show top 5 by default, top 25 when expanded (but limit to available scores)
    const maxExpanded = Math.min(25, allScores.length);
    const displayScores = expandedStandings ? allScores.slice(0, 25) : allScores.slice(0, 5);
    const canExpand = allScores.length > 5;
    
    return (
      <div className={`bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-xl shadow-lg overflow-hidden ${isMobile ? 'mb-4' : 'sticky top-20'}`} data-testid="tournament-standings">
        <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
            Tournament Top {expandedStandings ? maxExpanded : Math.min(5, allScores.length)}
          </h3>
          {canExpand && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setExpandedStandings(!expandedStandings)}
              className="h-7 px-2 text-white/70 hover:text-white hover:bg-white/10"
              data-testid="expand-standings"
            >
              {expandedStandings ? <><ChevronUp className="w-4 h-4 mr-1" />Top 5</> : <><ChevronDown className="w-4 h-4 mr-1" />Top 25</>}
            </Button>
          )}
        </div>
        <div className={`divide-y divide-white/5 ${expandedStandings ? 'max-h-[500px] overflow-y-auto' : ''}`}>
          {displayScores.length === 0 && (
            <div className="p-4 text-center text-xs text-white/50">No scores available</div>
          )}
          {displayScores.map((g, i) => (
            <div key={i} className="flex items-center px-4 py-2">
              <span className={`w-8 font-numbers font-bold text-xs ${i < 3 ? 'text-[#CCFF00]' : 'text-white/50'}`}>
                {g.position || i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-white truncate">{g.name}</span>
              {g.is_active && (
                <span className="text-[9px] font-bold text-green-400 mr-2">LIVE</span>
              )}
              <span className={`font-numbers font-bold text-sm ${
                g.total_score?.toString().startsWith('-') ? 'text-[#CCFF00]' : g.total_score === 'E' ? 'text-white/70' : 'text-white/70'
              }`}>
                {g.total_score}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in-up" data-testid="leaderboard-page">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F172A] tracking-tight">LEADERBOARD</h1>
        
        {/* Prominent Refresh Button */}
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          data-testid="refresh-leaderboard"
          className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white h-10 px-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Scores'}
        </Button>
      </div>
      
      {/* Last Updated */}
      {data?.last_updated && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Clock className="w-3 h-3" />
          Last updated: {new Date(data.last_updated).toLocaleTimeString()}
        </div>
      )}

      {/* Tournament Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" data-testid="leaderboard-tournament-tabs">
        {tournaments.map(t => (
          <button key={t.id || t.slot} onClick={() => { if (t.id) setSelectedTid(t.id); }}
            data-testid={`lb-tab-${t.slot}`}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedTid === t.id ? 'bg-[#1B4332] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#1B4332]/30'
            }`}>
            {t.name}
          </button>
        ))}
      </div>

      {!data || (!standings.length && !allScores.length) ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center" data-testid="no-leaderboard">
          <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-lg font-medium">Nothing to display yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back when the tournament begins.</p>
        </div>
      ) : (
        <>
          {/* Mobile: Tournament Standings at TOP */}
          <div className="lg:hidden">
            <TournamentStandingsBox isMobile={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Standings */}
            <div className="lg:col-span-2 space-y-3">
              {/* Winners Banner */}
              {finalized && winners.length > 0 && (
                <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-xl p-4 text-white mb-2" data-testid="winners-banner">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3 text-[#CCFF00]">
                    {data.tournament?.name} Champions
                  </h3>
                  <div className="flex gap-4 flex-wrap">
                    {winners.map((w, i) => (
                      <div key={w.team_id} className="flex items-center gap-2">
                        <Medal className={`w-5 h-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-amber-500'}`} />
                        <span className="font-bold text-sm">{w.team_name}</span>
                        <span className="text-xs text-white/60 font-numbers">{typeof w.total_points === 'number' ? w.total_points.toFixed(2) : w.total_points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standings.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No fantasy teams entered yet</p>
                </div>
              ) : (
                standings.map(team => (
                  <div key={team.team_id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
                    data-testid={`team-standing-${team.rank}`}>
                    <div className="flex items-center px-4 py-3 border-b border-slate-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-numbers font-bold text-sm mr-3 ${
                        team.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        team.rank === 2 ? 'bg-slate-100 text-slate-600' :
                        team.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {team.rank}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm text-[#0F172A]">{team.team_name}</span>
                      </div>
                      <span className="font-numbers font-bold text-lg text-[#1B4332]" data-testid={`team-points-${team.rank}`}>
                        {typeof team.total_points === 'number' ? team.total_points.toFixed(2) : team.total_points}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">pts</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {team.golfers.map((g, i) => (
                        <div key={i} className="flex items-center px-4 py-1.5 text-xs">
                          <span className={`w-10 font-numbers font-bold ${g.is_cut ? 'text-red-400' : g.is_active ? 'text-green-500 pulse-active' : 'text-slate-500'}`}>
                            {g.is_cut ? 'CUT' : g.position || '-'}
                            {g.is_active && !g.is_cut && '*'}
                          </span>
                          <span className="flex-1 font-medium text-[#0F172A] truncate">{g.name}</span>
                          <div className="hidden sm:flex gap-0.5 mr-2">
                            {renderRounds(g)}
                          </div>
                          <span className={`w-8 text-right font-numbers ${g.total_score === '-' ? 'text-slate-300' : 'text-slate-500'}`}>
                            {g.total_score}
                          </span>
                          {renderThru(g)}
                          <span className="w-12 text-right font-numbers font-bold text-[#1B4332]">{typeof g.total_points === 'number' ? g.total_points.toFixed(2) : g.total_points}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Tournament Standings on RIGHT */}
            <div className="hidden lg:block lg:col-span-1">
              <TournamentStandingsBox isMobile={false} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
