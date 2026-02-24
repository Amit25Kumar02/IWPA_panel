"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  Pencil,
  Search,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "../../lib/axios";


type TeamForm = {
  _id?: string;
  name: string;
  icon: File | null;
  preview: string | null;
};

type LeagueForm = {
  _id?: string;
  name: string;
  icon: File | null;
  preview: string | null;
  teams: TeamForm[];
};

type SportFormProps = {
  editMode: boolean;
  editSportId: string;
  onBack: () => void;
  onSuccess: () => void;
  initialData?: {
    name: string;
    status: boolean;
    iconPreview: string | null;
    leagues: LeagueForm[];
  };
};

const cropToSquare = (file: File, size = 300): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas error");

      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;

      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Blob failed");
          resolve(
            new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
        },
        "image/jpeg",
        0.95
      );
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function SportForm({ editMode, editSportId, onBack, onSuccess, initialData }: SportFormProps) {
  // Utility function to capitalize text
  const capitalizeText = (text: string) => {
    if (!text) return text;
    return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };
  const [sportName, setSportName] = useState(initialData?.name || "");
  const [sportStatus, setSportStatus] = useState(initialData?.status ?? true);
  const [sportIcon, setSportIcon] = useState<File | null>(null);
  const [sportIconPreview, setSportIconPreview] = useState<string | null>(initialData?.iconPreview || null);

  const isIndividualSport = ['golf', 'tennis'].includes(sportName.toLowerCase());
  const teamLabel = isIndividualSport ? 'Player' : 'Team';

  const [leagues, setLeagues] = useState<LeagueForm[]>(
    initialData?.leagues || [
      {
        name: "",
        icon: null,
        preview: null,
        teams: [{ name: "", icon: null, preview: null }],
      },
    ]
  );

  const [selectedLeagueIndex, setSelectedLeagueIndex] = useState<number | null>(null);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [leaguePage, setLeaguePage] = useState(1);
  const [teamPage, setTeamPage] = useState(1);
  const leaguesPerPage = 5;
  const teamsPerPage = 5;

  // Search states
  const [leagueSearch, setLeagueSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  // Pagination helpers with search
  const filteredLeagues = leagues.filter(league => 
    league.name.toLowerCase().includes(leagueSearch.toLowerCase())
  );
  const paginatedLeagues = filteredLeagues.slice((leaguePage - 1) * leaguesPerPage, leaguePage * leaguesPerPage);
  const totalLeaguePages = Math.ceil(filteredLeagues.length / leaguesPerPage);
  
  const getPaginatedTeams = (leagueIndex: number) => {
    const league = leagues[leagueIndex];
    if (!league) return [];
    const filteredTeams = league.teams.filter(team => 
      team.name.toLowerCase().includes(teamSearch.toLowerCase())
    );
    return filteredTeams.slice((teamPage - 1) * teamsPerPage, teamPage * teamsPerPage);
  };
  
  const getTotalTeamPages = (leagueIndex: number) => {
    const league = leagues[leagueIndex];
    if (!league) return 0;
    const filteredTeams = league.teams.filter(team => 
      team.name.toLowerCase().includes(teamSearch.toLowerCase())
    );
    return Math.ceil(filteredTeams.length / teamsPerPage);
  };

  const addLeague = () => {
    const names = leagues.map((l) => l.name.trim().toLowerCase()).filter(Boolean);
    if (new Set(names).size !== names.length) {
      toast.error("Duplicate league names in form. Fix before adding more leagues.");
      return;
    }

    setLeagues((prev) => [
      ...prev,
      { name: "", icon: null, preview: null, teams: [{ name: "", icon: null, preview: null }] },
    ]);
    
    // Navigate to last page to show new league
    const newTotalPages = Math.ceil((leagues.length + 1) / leaguesPerPage);
    setLeaguePage(newTotalPages);
  };

  const removeLeague = async (index: number) => {
    const league = leagues[index];

    if (leagues.length === 1) return toast.error("Minimum 1 league required");

    if (editMode && league?._id) {
      if (!confirm("Delete this league?")) return;
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/api/sports/deleteLeague/${editSportId}/${league._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("League deleted");
      } catch {
        toast.error("Failed to delete league");
        return;
      }
    }

    setLeagues((prev) => prev.filter((_, i) => i !== index));
    setSelectedLeagueIndex(null);
  };

  const addTeam = (leagueIndex: number) => {
    setLeagues((prev) =>
      prev.map((l, i) =>
        i === leagueIndex
          ? { ...l, teams: [...l.teams, { name: "", icon: null, preview: null }] }
          : l
      )
    );
    
    // Navigate to last page to show new team
    const league = leagues[leagueIndex];
    if (league) {
      const newTotalPages = Math.ceil((league.teams.length + 1) / teamsPerPage);
      setTeamPage(newTotalPages);
    }
  };

  const removeTeam = async (leagueIndex: number, teamIndex: number) => {
    const team = leagues[leagueIndex]?.teams[teamIndex];
    const league = leagues[leagueIndex];

    if (leagues[leagueIndex].teams.length === 1) {
      return toast.error("Minimum 1 team required");
    }

    if (editMode && team?._id) {
      if (!confirm("Delete this team?")) return;
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/api/sports/deleteTeam/${editSportId}/${league._id}/${team._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Team deleted");
      } catch {
        toast.error("Failed to delete team");
        return;
      }
    }

    setLeagues((prev) =>
      prev.map((l, i) => {
        if (i !== leagueIndex) return l;
        return { ...l, teams: l.teams.filter((_, ti) => ti !== teamIndex) };
      })
    );
  };

  const handleSubmit = async () => {
    if (!sportName.trim()) return toast.error("Sport name required");

    const validLeagues = leagues
      .filter((l) => l.name.trim())
      .map((l) => ({
        name: l.name.trim(),
        teams: l.teams.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim() })),
      }));

    if (!editMode && validLeagues.length === 0) {
      return toast.error("At least one league is required");
    }

    //  Frontend duplicate check (optional - backend also validates)
    const leagueNames = validLeagues.map((l) => l.name.toLowerCase());
    if (new Set(leagueNames).size !== leagueNames.length) {
      return toast.error("Duplicate league names not allowed");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("name", sportName.trim());
      fd.append("status", String(sportStatus));

      //  sport icon fieldname must be "icon"
      if (sportIcon) fd.append("icon", sportIcon);

      //  leagues JSON (without icons because icons will be files)
      fd.append("leagues", JSON.stringify(validLeagues));

      //  append league icons + team icons with correct fieldnames
      leagues.forEach((league, li) => {
        if (!league.name.trim()) return;

        // league icon
        if (league.icon) {
          fd.append(`leagueIcon_${li}`, league.icon);
        }

        // teams icon
        league.teams.forEach((team, ti) => {
          if (!team.name.trim()) return;
          if (team.icon) {
            fd.append(`teamIcon_${li}_${ti}`, team.icon);
          }
        });
      });

      if (editMode) {
        await api.put(`/api/sports/updateSport/${editSportId}`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Sport updated");
      } else {
        await api.post(`/api/sports/createSport`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Sport created ");
      }

      toast.success("All data saved ");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.msg || err.message || "Submit failed");
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
              {editMode ? "Update Sport" : "Add New Sport"}
            </h1>
            <p className="text-muted-foreground">
              {editMode
                ? "Update sport details and manage leagues & teams"
                : "Create a new sport with multiple leagues & teams"}
            </p>
          </div>
        </div>
        
        <div className="flex items-start justify-end">
          <div className="md:text-right">
            <h4 className="text-sm text-muted-foreground font-medium">
              Recommended Image Size:{" "}
              <span className="ml-1 font-semibold text-foreground">48px by 48px</span>
              <span className="mx-2 text-muted-foreground">, </span>
              <span className="text-muted-foreground">Aspect Ratio:{" "}</span>
              <span className="ml-1 font-semibold text-foreground">1:1</span>
            </h4>
          </div>
        </div>
      </div>

      {/* Sport Information Card */}
      <Card className="p-8 space-y-6 shadow-sm">
        <h2 className="font-semibold text-lg">Sport Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Sport Name <span className="text-danger">*</span></label>
            <Input
              value={sportName}
              onChange={(e) => setSportName(e.target.value)}
              placeholder="Enter sport name"
              className="h-12 text-base capitalize"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Sport Icon</label>
            <div className="flex items-start gap-4">
              <label className="border-2 border-dashed border-primary/30 p-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer hover:bg-primary/5 transition-colors min-w-[120px] flex-1">
                <ImageIcon size={20} className="text-primary" />
                <span className="text-sm font-medium text-primary text-center">
                  {sportIconPreview ? 'Change Icon' : 'Upload Icon'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const square = await cropToSquare(file, 512);
                    setSportIcon(square);
                    setSportIconPreview(URL.createObjectURL(square));
                  }}
                />
              </label>
              {sportIconPreview && (
                <div className="relative">
                  <img
                    src={sportIconPreview}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20"
                    alt="Sport icon"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={sportStatus}
              onChange={(e) => setSportStatus(e.target.checked)}
              className="w-5 h-5 text-primary"
            />
            <div>
              <span className="text-sm font-medium">Active Status</span>
              <p className="text-xs text-muted-foreground">Enable this sport for public use</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Leagues Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Leagues Management</h2>
          <Button variant="outline" onClick={addLeague} className="px-4 py-2">
            <Plus size={16} className="mr-2" /> Add League
          </Button>
        </div>

        {editMode && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leagues..."
              value={leagueSearch}
              onChange={(e) => {
                setLeagueSearch(e.target.value);
                setLeaguePage(1);
              }}
              className="pl-10"
            />
          </div>
        )}

        {editMode ? (
          /* Edit Mode - League List */
          <div className="space-y-4">
            {leagues.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No leagues found for this sport</p>
                <Button variant="outline" onClick={addLeague} className="mt-4">
                  <Plus size={16} className="mr-2" /> Add First League
                </Button>
              </Card>
            ) : (
              <>
                {paginatedLeagues.map((league, displayIndex) => {
                  const leagueIndex = (leaguePage - 1) * leaguesPerPage + displayIndex;
                  return (
                    <Card key={leagueIndex} className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {league.preview && (
                            <img 
                              src={league.preview} 
                              className="w-10 h-10 rounded object-cover" 
                              alt="League" 
                              onError={(e) => {
                                console.log('League icon failed to load:', league.preview);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{capitalizeText(league.name) || 'Add New League Click Edit'}</h4>
                            <p className="text-sm text-muted-foreground">{league.teams?.length || 0} teams</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLeagueIndex(selectedLeagueIndex === leagueIndex ? null : leagueIndex)}
                          >
                            <Pencil size={14} className="mr-1" /> {selectedLeagueIndex === leagueIndex ? 'Close' : ''}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeLeague(leagueIndex)}
                          >
                            <Trash2 size={14} className="mr-1" />
                          </Button>
                        </div>
                      </div>

                      {/* League Edit Form & Teams List */}
                      {selectedLeagueIndex === leagueIndex && (
                        <div className="mt-6 pt-6 border-t space-y-6">
                          {/* League Edit Form */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="block text-sm font-medium">League Name *</label>
                              <Input
                                value={league.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLeagues((prev) =>
                                    prev.map((l, i) =>
                                      i === leagueIndex ? { ...l, name: val } : l
                                    )
                                  );
                                }}
                                placeholder="Enter league name"
                                className="h-12 capitalize"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="block text-sm font-medium">League Icon</label>
                              <div className="flex items-start gap-4">
                                <label className="border-2 border-dashed border-primary/30 p-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer hover:bg-primary/5 transition-colors min-w-[120px] flex-1">
                                  <ImageIcon size={20} className="text-primary" />
                                  <span className="text-sm font-medium text-primary text-center">
                                    {league.preview ? 'Change Icon' : 'Upload Icon'}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const square = await cropToSquare(file, 512);
                                      setLeagues((prev) =>
                                        prev.map((l, i) =>
                                          i === leagueIndex
                                            ? { ...l, icon: square, preview: URL.createObjectURL(square) }
                                            : l
                                        )
                                      );
                                    }}
                                  />
                                </label>
                                {league.preview && (
                                  <div className="relative">
                                    <img
                                      src={league.preview}
                                      className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20"
                                      alt="League icon"
                                      onError={(e) => {
                                        console.log('League icon failed to load:', league.preview);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Teams Section */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="font-medium">{teamLabel}s in {league.name} </h5>
                              <Button variant="outline" size="sm" onClick={() => addTeam(leagueIndex)}>
                                <Plus size={14} className="mr-1" /> Add {teamLabel}
                              </Button>
                            </div>
                            
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-muted-foreground" />
                              <Input
                                placeholder={`Search ${teamLabel.toLowerCase()}s...`}
                                value={teamSearch}
                                onChange={(e) => {
                                  setTeamSearch(e.target.value);
                                  setTeamPage(1);
                                }}
                                className="pl-10"
                                size="sm"
                              />
                            </div>
                            <div className="space-y-3">
                              {getPaginatedTeams(leagueIndex).map((team, displayTeamIndex) => {
                                const teamIndex = (teamPage - 1) * teamsPerPage + displayTeamIndex;
                                return (
                                  <div key={teamIndex} className="p-3 bg-muted/30 rounded">
                                    {selectedTeamIndex === teamIndex && selectedLeagueIndex === leagueIndex ? (
                                      /* Team Edit Form */
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                          <label className="block text-sm font-medium">{teamLabel} Name *</label>
                                          <Input
                                            value={team.name}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setLeagues((prev) =>
                                                prev.map((lg, i) => {
                                                  if (i !== leagueIndex) return lg;
                                                  return {
                                                    ...lg,
                                                    teams: lg.teams.map((tm, ti) =>
                                                      ti === teamIndex ? { ...tm, name: val } : tm
                                                    ),
                                                  };
                                                })
                                              );
                                            }}
                                            placeholder={`Enter ${teamLabel.toLowerCase()} name`}
                                            className="h-10 capitalize"
                                          />
                                        </div>
                                        <div className="space-y-3">
                                          <label className="block text-sm font-medium">{teamLabel} Icon</label>
                                          <div className="flex items-start gap-4">
                                            <label className="border-2 border-dashed border-blue-200 p-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer hover:bg-blue-50 transition-colors min-w-[100px] flex-1">
                                              <ImageIcon size={16} className="text-blue-600" />
                                              <span className="text-blue-600 font-medium text-xs">
                                                {team.preview ? 'Change' : 'Upload'}
                                              </span>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  const square = await cropToSquare(file, 512);
                                                  setLeagues((prev) =>
                                                    prev.map((lg, i) => {
                                                      if (i !== leagueIndex) return lg;
                                                      return {
                                                        ...lg,
                                                        teams: lg.teams.map((tm, ti) =>
                                                          ti === teamIndex
                                                            ? { ...tm, icon: square, preview: URL.createObjectURL(square) }
                                                            : tm
                                                        ),
                                                      };
                                                    })
                                                  );
                                                }}
                                              />
                                            </label>
                                            {team.preview && (
                                              <img 
                                                src={team.preview} 
                                                className="w-16 h-16 rounded object-cover border-2 border-blue-200" 
                                                alt="Team" 
                                                onError={(e) => {
                                                  console.log('Team icon failed to load:', team.preview);
                                                  e.currentTarget.style.display = 'none';
                                                }}
                                              />
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex gap-2 md:col-span-2">
                                          <Button variant="outline" size="sm" onClick={() => setSelectedTeamIndex(null)}>
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => removeTeam(leagueIndex, teamIndex)}
                                          >
                                            <Trash2 size={14} /> Delete
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* Team Display */
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                          {team.preview && (
                                            <img 
                                              src={team.preview} 
                                              className="w-8 h-8 rounded object-cover" 
                                              alt="Team" 
                                              onError={(e) => {
                                                console.log('Team icon failed to load:', team.preview);
                                                e.currentTarget.style.display = 'none';
                                              }}
                                            />
                                          )}
                                          <span className="font-medium">{capitalizeText(team.name) || "Add New Team Click Edit"}</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSelectedTeamIndex(selectedTeamIndex === teamIndex ? null : teamIndex)}
                                          >
                                            <Pencil size={14} className="mr-1" /> 
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive"
                                            onClick={() => removeTeam(leagueIndex, teamIndex)}
                                          >
                                            <Trash2 size={14} /> 
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Team Pagination */}
                            {getTotalTeamPages(leagueIndex) > 1 && (
                              <div className="flex justify-center gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={teamPage === 1}
                                  onClick={() => setTeamPage(teamPage - 1)}
                                >
                                  Prev
                                </Button>
                                <span className="px-3 py-1 text-sm">
                                  {teamPage} of {getTotalTeamPages(leagueIndex)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={teamPage === getTotalTeamPages(leagueIndex)}
                                  onClick={() => setTeamPage(teamPage + 1)}
                                >
                                  Next
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
                
                {/* League Pagination */}
                {totalLeaguePages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      disabled={leaguePage === 1}
                      onClick={() => setLeaguePage(leaguePage - 1)}
                    >
                      Prev
                    </Button>
                    <span className="px-3 py-2 text-sm">
                      {leaguePage} of {totalLeaguePages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={leaguePage === totalLeaguePages}
                      onClick={() => setLeaguePage(leaguePage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Create Mode - Full Form */
          <div className="space-y-8">
            {leagues.map((league, leagueIndex) => (
              <Card key={leagueIndex} className="p-8 space-y-6 border-2 border-dashed border-primary/20">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">🏆</span>
                    League {leagueIndex + 1}
                  </h3>
                  {leagues.length > 1 && (
                    <Button
                      variant="outline"
                      className="text-destructive px-4 py-2"
                      onClick={() => removeLeague(leagueIndex)}
                    >
                      <Trash2 size={14} className="mr-2" /> Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">League Name <span className="text-danger">*</span></label>
                    <Input
                      value={league.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLeagues((prev) =>
                          prev.map((l, i) =>
                            i === leagueIndex ? { ...l, name: val } : l
                          )
                        );
                      }}
                      placeholder="Enter league name"
                      className="h-12 capitalize"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium">League Icon</label>
                    <div className="flex items-start gap-4">
                      <label className="border-2 border-dashed border-primary/30 p-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer hover:bg-primary/5 transition-colors min-w-[120px] flex-1">
                        <ImageIcon size={20} className="text-primary" />
                        <span className="text-sm font-medium text-primary text-center">
                          {league.preview ? 'Change Icon' : 'Upload Icon'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const square = await cropToSquare(file, 512);
                            setLeagues((prev) =>
                              prev.map((l, i) =>
                                i === leagueIndex
                                  ? { ...l, icon: square, preview: URL.createObjectURL(square) }
                                  : l
                              )
                            );
                          }}
                        />
                      </label>
                      {league.preview && (
                        <div className="relative">
                          <img
                            src={league.preview}
                            className="w-24 h-24 rounded-lg object-cover border-2 border-primary/20"
                            alt="League icon"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teams */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-semibold flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm">👥</span>
                      {teamLabel}s
                    </h4>
                    <Button
                      variant="outline"
                      onClick={() => addTeam(leagueIndex)}
                      className="px-4 py-2"
                    >
                      <Plus size={14} className="mr-2" /> Add {teamLabel}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {league.teams.map((t, teamIndex) => (
                      <Card key={teamIndex} className="p-6 bg-muted/30 border border-muted">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                          <div className="space-y-3">
                            <label className="block text-sm font-medium">{teamLabel} Name <span className="text-danger">*</span></label>
                            <Input
                              value={t.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLeagues((prev) =>
                                  prev.map((lg, i) => {
                                    if (i !== leagueIndex) return lg;
                                    return {
                                      ...lg,
                                      teams: lg.teams.map((tm, ti) =>
                                        ti === teamIndex ? { ...tm, name: val } : tm
                                      ),
                                    };
                                  })
                                );
                              }}
                              placeholder={`Enter ${teamLabel.toLowerCase()} name`}
                              className="h-12 capitalize"
                            />
                          </div>

                          <div className="flex gap-3 items-end">
                            <div className="flex-1 space-y-3">
                              <p className="block text-sm font-medium">{teamLabel} Icon</p>
                              <label className="border-2 border-dashed border-blue-200 p-4 rounded-lg flex items-center justify-center gap-1 cursor-pointer hover:bg-blue-50 transition-colors text-xs">
                                <ImageIcon size={16} className="text-blue-600" />
                                <span className="text-blue-600 font-medium">{teamLabel} Icon</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const square = await cropToSquare(file, 512);
                                    setLeagues((prev) =>
                                      prev.map((lg, i) => {
                                        if (i !== leagueIndex) return lg;
                                        return {
                                          ...lg,
                                          teams: lg.teams.map((tm, ti) =>
                                            ti === teamIndex
                                              ? {
                                                ...tm,
                                                icon: square,
                                                preview: URL.createObjectURL(square),
                                              }
                                              : tm
                                          ),
                                        };
                                      })
                                    );
                                  }}
                                />
                              </label>
                            </div>

                            <Button
                              variant="outline"
                              className="text-destructive p-4 mt-8"
                              onClick={() => removeTeam(leagueIndex, teamIndex)}
                            >
                              <Trash2 size={20} />
                            </Button>
                          </div>
                        </div>

                        {t.preview && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="relative inline-block">
                              <img
                                src={t.preview}
                                className="w-16 h-16 rounded-lg object-cover border-2 border-blue-200"
                                alt="Team icon"
                              />
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-end pt-6">
              <Button variant="outline" onClick={addLeague} className="px-6 py-3">
                <Plus size={16} className="mr-2" /> Add More League
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 p-6 border-t">
        <Button variant="outline" size="lg" onClick={onBack} className="px-8" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          className="bg-primary-gradient text-white px-8"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : (editMode ? "Update Sport" : "Create Sport")}
        </Button>
      </div>
    </div>
  );
}