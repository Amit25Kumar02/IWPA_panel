"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import api from "../../lib/axios";

type BetFormProps = {
  editMode: boolean;
  editId: string;
  onBack: () => void;
  onSuccess: () => void;
  initialData?: {
    sport: string;
    league: string;
    teamAName: string;
    teamBName: string;
    teamAPick: boolean;
    teamBPick: boolean;
    winPercent: string;
    risk: string;
    spread: string;
    tip: string;
    analysis: string;
    matchTime: string;
    tipResult: 'win' | 'lose' | 'pending';
  };
  sports: any[];
  leagues: any[];
  teams: any[];
};

export default function BetForm({
  editMode,
  editId,
  onBack,
  onSuccess,
  initialData,
  sports,
  leagues,
  teams
}: BetFormProps) {
  // Utility function to capitalize text
  const capitalizeText = (text: string) => {
    if (!text) return text;
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  const [sport, setSport] = useState(initialData?.sport || "");
  const [league, setLeague] = useState(initialData?.league || "");
  const [teamAName, setTeamAName] = useState(initialData?.teamAName || "");
  const [teamBName, setTeamBName] = useState(initialData?.teamBName || "");
  const [teamAPick, setTeamAPick] = useState(initialData?.teamAPick || false);
  const [teamBPick, setTeamBPick] = useState(initialData?.teamBPick || false);
  const [winPercent, setWinPercent] = useState(initialData?.winPercent || "");
  const [risk, setRisk] = useState(initialData?.risk || "Low");
  const [spread, setSpread] = useState(initialData?.spread || "");
  const [tip, setTip] = useState(initialData?.tip || "");
  const [analysis, setAnalysis] = useState(initialData?.analysis || "");
  const [matchTime, setMatchTime] = useState(initialData?.matchTime || "");
  const [tipResult, setTipResult] = useState<'win' | 'lose' | 'pending'>(initialData?.tipResult || 'pending');

  // const selectedSportName = sports.find(s => s._id === sport)?.name?.toLowerCase() || '';
  // const isIndividualSport = ['golf', 'tennis'].includes(selectedSportName);
  const teamLabel = 'Field';

  // Search states for dropdowns
  const [sportSearch, setSportSearch] = useState(initialData ? sports.find(s => s._id === initialData.sport)?.name || "" : "");
  const [leagueSearch, setLeagueSearch] = useState(initialData?.league || "");
  const [teamASearch, setTeamASearch] = useState(initialData?.teamAName || "");
  const [teamBSearch, setTeamBSearch] = useState(initialData?.teamBName || "");
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [showLeagueDropdown, setShowLeagueDropdown] = useState(false);
  const [showTeamADropdown, setShowTeamADropdown] = useState(false);
  const [showTeamBDropdown, setShowTeamBDropdown] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".searchable-dropdown")) {
        setShowSportDropdown(false);
        setShowLeagueDropdown(false);
        setShowTeamADropdown(false);
        setShowTeamBDropdown(false);
      }
    };

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const calculateRiskFromWinPercent = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return "Low";
    if (num >= 50 && num <= 65) return "Low";
    if (num >= 66 && num <= 80) return "Medium";
    if (num >= 81 && num <= 100) return "High";
    return "Low";
  };

  const filteredSports = sportSearch.trim() === '' ? sports : (() => {
    const search = sportSearch.toLowerCase();
    const matches = sports.filter(s => s.name.toLowerCase().includes(search));
    const nonMatches = sports.filter(s => !s.name.toLowerCase().includes(search));
    return [...matches, ...nonMatches];
  })();

  const filteredLeagues = sport ?
    (leagueSearch.trim() === '' ? leagues.filter(l => l.sportId === sport) : (() => {
      const search = leagueSearch.toLowerCase();
      const allLeagues = leagues.filter(l => l.sportId === sport);
      const matches = allLeagues.filter(l => l.name.toLowerCase().includes(search));
      const nonMatches = allLeagues.filter(l => !l.name.toLowerCase().includes(search));
      return [...matches, ...nonMatches];
    })()) : [];

  const filteredTeamsA = sport && league ?
    (teamASearch.trim() === '' ? teams.filter(t => t.sportId === sport && t.leagueName === league && t.name !== teamBName) : (() => {
      const search = teamASearch.toLowerCase();
      const allTeams = teams.filter(t => t.sportId === sport && t.leagueName === league && t.name !== teamBName);
      const matches = allTeams.filter(t => t.name.toLowerCase().includes(search));
      const nonMatches = allTeams.filter(t => !t.name.toLowerCase().includes(search));
      return [...matches, ...nonMatches];
    })()) : [];

  const filteredTeamsB = sport && league ?
    (teamBSearch.trim() === '' ? teams.filter(t => t.sportId === sport && t.leagueName === league && t.name !== teamAName) : (() => {
      const search = teamBSearch.toLowerCase();
      const allTeams = teams.filter(t => t.sportId === sport && t.leagueName === league && t.name !== teamAName);
      const matches = allTeams.filter(t => t.name.toLowerCase().includes(search));
      const nonMatches = allTeams.filter(t => !t.name.toLowerCase().includes(search));
      return [...matches, ...nonMatches];
    })()) : [];

  const handleSportChange = (selectedSport: string) => {
    setSport(selectedSport);
    setLeague("");
    setTeamAName("");
    setTeamBName("");
    const sportName = sports.find(s => s._id === selectedSport)?.name || "";
    setSportSearch(capitalizeText(sportName));
    setLeagueSearch("");
    setTeamASearch("");
    setTeamBSearch("");
    setShowSportDropdown(false);
  };

  const handleLeagueChange = (selectedLeague: string) => {
    setLeague(selectedLeague);
    setTeamAName("");
    setTeamBName("");
    setLeagueSearch(capitalizeText(selectedLeague));
    setTeamASearch("");
    setTeamBSearch("");
    setShowLeagueDropdown(false);
  };

  const handleLeagueInput = (value: string) => {
    setLeagueSearch(value);
    setLeague(value);
  };

  const handleTeamAInput = (value: string) => {
    setTeamASearch(value);
    setTeamAName(value);
  };

  const handleTeamBInput = (value: string) => {
    setTeamBSearch(value);
    setTeamBName(value);
  };

  function localToUTC(localDateTime: string) {
    const local = new Date(localDateTime);
    return local.toISOString();
  }

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!sport && !sportSearch.trim()) newErrors.sport = "Sport is required";
    if (!league) newErrors.league = "League is required";
    if (!teamAName) newErrors.teamAName = "Team A name is required";
    if (!teamBName) newErrors.teamBName = "Team B name is required";
    if (teamAName === teamBName) newErrors.teamBName = "Team A and Team B cannot be the same";
    if (!winPercent) newErrors.winPercent = "Win percentage is required";
    if (winPercent && Number(winPercent) < 50) newErrors.winPercent = "Win percentage must be at least 50%";
    if (!spread) newErrors.spread = "Spread is required";
    if (!tip) newErrors.tip = "Tip is required";
    if (!matchTime) newErrors.matchTime = "Match time is required";
    if (!teamAPick && !teamBPick) newErrors.pick = "Please select a winning team";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    let finalSportId = sport;

    try {
      // Create sport if it doesn't exist
      if (!sport && sportSearch.trim()) {
        const fd = new FormData();
        fd.append("name", sportSearch.trim());
        fd.append("status", "true");
        fd.append("leagues", JSON.stringify([{name: league, teams: [{name: teamAName}, {name: teamBName}]}]));
        const res = await api.post("/api/sports/createSport", fd, { headers: { Authorization: `Bearer ${token}` } });
        finalSportId = res.data.data._id;
      } else {
        // Check if league exists
        const sportData = sports.find(s => s._id === sport);
        const existingLeagues = sportData?.leagues || [];
        const leagueExists = existingLeagues.some((l: any) => l.name === league);
        
        if (!leagueExists) {
          // Create league with teams
          const fd = new FormData();
          fd.append("name", sportData?.name || "");
          fd.append("status", "true");
          fd.append("leagues", JSON.stringify([...existingLeagues, {name: league, teams: [{name: teamAName}, {name: teamBName}]}]));
          await api.put(`/api/sports/updateSport/${sport}`, fd, { headers: { Authorization: `Bearer ${token}` } });
        } else {
          // Check if teams need to be created
          const targetLeague = existingLeagues.find((l: any) => l.name === league);
          const existingTeams = targetLeague?.teams || [];
          const teamAExists = existingTeams.some((t: any) => t.name === teamAName);
          const teamBExists = existingTeams.some((t: any) => t.name === teamBName);
          
          if (!teamAExists || !teamBExists) {
            const updatedTeams = [...existingTeams];
            if (!teamAExists) updatedTeams.push({ name: teamAName });
            if (!teamBExists) updatedTeams.push({ name: teamBName });
            
            const updatedLeagues = existingLeagues.map((l: any) => 
              l.name === league ? { ...l, teams: updatedTeams } : l
            );
            
            const fd = new FormData();
            fd.append("name", sportData?.name || "");
            fd.append("status", "true");
            fd.append("leagues", JSON.stringify(updatedLeagues));
            await api.put(`/api/sports/updateSport/${sport}`, fd, { headers: { Authorization: `Bearer ${token}` } });
          }
        }
      }

      const payload = {
        sport: finalSportId,
        league,
        teamAName,
        teamAPick,
        teamBName,
        teamBPick,
        winPercent,
        risk,
        spread,
        tip,
        analysis,
        matchTime: localToUTC(matchTime),
      };

      if (editMode) {
        await api.put(`/api/tips/updateTip/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Updated");
      } else {
        await api.post(`/api/tips/createTip`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Created");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-2">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="px-6 py-3">
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>
          <div>
            <h1 className="font-bold text-2xl mb-1">
              {editMode ? "Update Bet" : "Add New Bet"}
            </h1>
            <p className="text-muted-foreground">
              {editMode ? "Update bet details" : "Create a new betting tip"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Sport <span className="text-danger">*</span></label>
            <div className="relative searchable-dropdown w-full">
              <input
                type="text"
                placeholder="Search and select sport..."
                value={sportSearch}
                onChange={(e) => {
                  setSportSearch(e.target.value);
                  setShowSportDropdown(true);
                  setShowLeagueDropdown(false);
                  setShowTeamADropdown(false);
                  setShowTeamBDropdown(false);
                }}
                onFocus={() => {
                  setShowSportDropdown(true);
                  setShowLeagueDropdown(false);
                  setShowTeamADropdown(false);
                  setShowTeamBDropdown(false);
                }}
                className={`w-full pr-8 p-2 border rounded outline-none capitalize ${errors.sport ? 'border-red-500' : 'border'}`}
              />
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer"
                onClick={() => {
                  setSportSearch("");
                  setShowSportDropdown(!showSportDropdown);
                }}
              />

              {showSportDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[240px] overflow-y-auto overscroll-contain">
                  {filteredSports.length > 0 ? (
                    filteredSports.map((s) => (
                      <div
                        key={s._id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm capitalize"
                        onClick={() => handleSportChange(s._id)}
                      >
                        {capitalizeText(s.name)}
                      </div>
                    ))
                  ) : (
                    sportSearch.trim() && (
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-primary font-medium"
                        onClick={() => {
                          setSport("NEW_SPORT");
                          setShowSportDropdown(false);
                          toast.info("Sport will be created when you save the bet");
                        }}
                      >
                      {sportSearch}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            {errors.sport && <p className="text-danger text-xs mt-1">{errors.sport}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">League Name <span className="text-danger">*</span></label>
            <div className="relative searchable-dropdown w-full">
              <input
                type="text"
                placeholder="Search and select league..."
                value={leagueSearch}
                onChange={(e) => {
                  handleLeagueInput(e.target.value);
                  setShowLeagueDropdown(true);
                  setShowSportDropdown(false);
                  setShowTeamADropdown(false);
                  setShowTeamBDropdown(false);
                }}
                onFocus={() => {
                  setShowLeagueDropdown(true);
                  setShowSportDropdown(false);
                  setShowTeamADropdown(false);
                  setShowTeamBDropdown(false);
                }}
                disabled={!sport && !sportSearch.trim()}
                className={`w-full pr-8 p-2 border rounded outline-none capitalize ${errors.league ? 'border-red-500' : 'border'}`}
              />
              <ChevronDown
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4  cursor-pointer ${!sport ? 'opacity-100 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!sport) return;
                  setLeagueSearch("");
                  setShowLeagueDropdown(!showLeagueDropdown);
                }}
              />
              {showLeagueDropdown && sport && (
                <div className="absolute left-0 top-full mt-1 z-50 w-full bg-background border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                  {filteredLeagues.length > 0 ? (
                    filteredLeagues.map((l, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm whitespace-nowrap overflow-hidden text-ellipsis capitalize"
                        onClick={() => handleLeagueChange(l.name)}
                      >
                        {capitalizeText(l.name)}
                      </div>
                    ))
                  ) : (
                    leagueSearch.trim() && (
                      <div
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-primary font-medium"
                        onClick={() => {
                          setLeague(leagueSearch.trim());
                          setShowLeagueDropdown(false);
                          toast.info("League will be created when you save the bet");
                        }}
                      >
                        {leagueSearch}
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
            {errors.league && <p className="text-danger text-xs mt-1">{errors.league}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{teamLabel} A <span className="text-danger">*</span></label>
              <div className="relative searchable-dropdown">
                <input
                  type="text"
                  placeholder={`Search and select ${teamLabel} A...`}
                  value={teamASearch}
                  onChange={(e) => {
                    handleTeamAInput(e.target.value);
                    setShowTeamADropdown(true);
                    setShowSportDropdown(false);
                    setShowLeagueDropdown(false);
                    setShowTeamBDropdown(false);
                  }}
                  onFocus={() => {
                    setShowTeamADropdown(true);
                    setShowSportDropdown(false);
                    setShowLeagueDropdown(false);
                    setShowTeamBDropdown(false);
                  }}
                  disabled={(!sport && !sportSearch.trim()) || !league}
                  className={`w-full pr-8 p-2 border rounded outline-none capitalize ${errors.teamAName ? 'border-red-500' : 'border'} ${((!sport && !sportSearch.trim()) || !league) ? '' : ''}`}
                />
                <ChevronDown
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer ${(!sport || !league) ? 'opacity-100 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (!sport || !league) return;
                    setTeamASearch("");
                    setShowTeamADropdown(!showTeamADropdown);
                  }}
                />
                {showTeamADropdown && sport && league && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                    {filteredTeamsA.length > 0 ? (
                      filteredTeamsA.map((t, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm capitalize"
                          onClick={() => {
                            setTeamAName(t.name);
                            setTeamASearch(capitalizeText(t.name));
                            setShowTeamADropdown(false);
                          }}
                        >
                          {capitalizeText(t.name)}
                        </div>
                      ))
                    ) : (
                      teamASearch.trim() && (
                        <div
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-primary font-medium"
                          onClick={() => {
                            setTeamAName(teamASearch.trim());
                            setShowTeamADropdown(false);
                            toast.info("Team will be created when you save the bet");
                          }}
                        >
                        {teamASearch}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              {errors.teamAName && <p className="text-danger text-xs mt-1">{errors.teamAName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{teamLabel} B <span className="text-danger">*</span> </label>
              <div className="relative searchable-dropdown w-full">

                <input
                  type="text"
                  placeholder={`Search and select ${teamLabel} B...`}
                  value={teamBSearch}
                  onChange={(e) => {
                    handleTeamBInput(e.target.value);
                    setShowTeamBDropdown(true);
                    setShowSportDropdown(false);
                    setShowLeagueDropdown(false);
                    setShowTeamADropdown(false);
                  }}
                  onFocus={() => {
                    setShowTeamBDropdown(true);
                    setShowSportDropdown(false);
                    setShowLeagueDropdown(false);
                    setShowTeamADropdown(false);
                  }}
                  disabled={(!sport && !sportSearch.trim()) || !league}
                  className={`w-full pr-8 p-2 border rounded outline-none capitalize ${errors.teamBName ? 'border-red-500' : 'border'} ${((!sport && !sportSearch.trim()) || !league) ? '' : ''}`}
                />
                <ChevronDown
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer ${(!sport || !league) ? 'opacity-100 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (!sport || !league) return;
                    setTeamBSearch("");
                    setShowTeamBDropdown(!showTeamBDropdown);
                  }}
                />
                {showTeamBDropdown && sport && league && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[240px] overflow-y-auto">
                    {filteredTeamsB.length > 0 ? (
                      filteredTeamsB.map((t, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm capitalize"
                          onClick={() => {
                            setTeamBName(t.name);
                            setTeamBSearch(capitalizeText(t.name));
                            setShowTeamBDropdown(false);
                          }}
                        >
                          {capitalizeText(t.name)}
                        </div>
                      ))
                    ) : (
                      teamBSearch.trim() && (
                        <div
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-primary font-medium"
                          onClick={() => {
                            setTeamBName(teamBSearch.trim());
                            setShowTeamBDropdown(false);
                            toast.info("Team will be created when you save the bet");
                          }}
                        >
                        {teamBSearch}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              {errors.teamBName && <p className="text-danger text-xs mt-1">{errors.teamBName}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Spread <span className="text-danger">*</span> </label>
            <input
              type="text"
              value={spread}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length > 5) return;
                
                // Allow only +, -, numbers, and one dot
                if (!/^[+\-]?\d*\.?\d*$/.test(value)) return;
                
                const parts = value.split('.');
                if (parts.length > 2) return;
                if (parts.length === 2 && parts[1].length > 1) return;
                
                setSpread(value);
              }}
              maxLength={5}
              placeholder="+4.5"
              className={`w-full p-2 border rounded outline-none ${errors.spread ? 'border-red-500' : 'border'}`}
            />
            {errors.spread && <p className="text-danger text-xs mt-1">{errors.spread}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Win % <span className="text-danger">*</span> </label>
              <input
                type="number"
                min={50}
                max={100}
                value={winPercent}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setWinPercent('');
                    setRisk('Low');
                    return;
                  }
                  const firstDigit = value.charAt(0);
                  if (['0', '2', '3', '4'].includes(firstDigit)) {
                    return;
                  }
                  if (firstDigit === '1' && value.length > 1) {
                    setWinPercent('100');
                    setRisk(calculateRiskFromWinPercent('100'));
                    return;
                  }
                  const num = Number(value);
                  if (value.length <= 3 && num <= 100) {
                    setWinPercent(value);
                    if (num >= 50) {
                      setRisk(calculateRiskFromWinPercent(value));
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.') {
                    e.preventDefault();
                  }
                }}
                className="w-full p-2 border rounded border-border bg-background outline-none"
              />
              {errors.winPercent && <p className="text-danger text-xs mt-1">{errors.winPercent}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Risk <span className="text-danger">*</span> </label>
              <select
                value={risk}
                disabled
                className="w-full border rounded p-2 text-sm bg-muted cursor-not-allowed outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Match Date & Time <span className="text-danger">*</span> </label>
            <input
              id="matchTimeInput"
              type="datetime-local"
              value={matchTime}
              onChange={(e) => {
                const selectedTime = new Date(e.target.value);
                const currentTime = new Date();
                if (selectedTime < currentTime) {
                  toast.error("Cannot select past date and time");
                  return;
                }
                setMatchTime(e.target.value);
              }}
              onClick={() => {
                const input = document.getElementById("matchTimeInput") as HTMLInputElement;
                input?.showPicker();
              }}
              min={new Date().toISOString().slice(0, 16)}
              className={`w-full p-2 border rounded cursor-pointer outline-none ${errors.matchTime ? "border-red-500" : "border"}`}
            />
            {errors.matchTime && <p className="text-danger text-xs mt-1">{errors.matchTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tip Summary <span className="text-danger">*</span> </label>
            <input
              type="text"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="Add tip summary"
              className={`w-full p-2 border rounded outline-none capitalize ${errors.tip ? 'border-red-500' : 'border'}`}
            />
            {errors.tip && <p className="text-danger text-xs mt-1">{errors.tip}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <ClipboardList size={16} /> Detailed Analysis
            </label>
            <textarea
              className="w-full min-h-[80px] border rounded p-2 text-sm bg-background outline-none capitalize"
              placeholder="Point 1 , Point 2..."
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Winning {teamLabel} <span className="text-danger">*</span> </label>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant={teamAPick ? "default" : "outline"} onClick={() => { setTeamAPick(true); setTeamBPick(false); }}>Pick {teamLabel} A</Button>
              <Button type="button" variant={teamBPick ? "default" : "outline"} onClick={() => { setTeamBPick(true); setTeamAPick(false); }}>Pick {teamLabel} B</Button>
            </div>
            {errors.pick && <p className="text-danger text-xs mt-1">{errors.pick}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Cancel</Button>
            <Button className="bg-primary-gradient text-textA" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "..." : (editMode ? "Update" : "Create")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}