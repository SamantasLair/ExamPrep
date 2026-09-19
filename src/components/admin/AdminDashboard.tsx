'use client';

import { useState } from 'react';
import { BankSoalTab } from '@/components/admin/BankSoalTab';
import { BankSoalPickerModal } from '@/components/admin/BankSoalPickerModal';
import { PrintModal } from '@/components/admin/PrintModal';
import { DangerZoneTab } from '@/components/admin/DangerZoneTab';
import { TestsTab } from '@/components/admin/TestsTab';
import { AttemptsTab } from '@/components/admin/AttemptsTab';
import { StudentsTab } from '@/components/admin/StudentsTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import { EditorTab } from '@/components/admin/EditorTab';
import { PromptTab } from '@/components/admin/PromptTab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Printer, CheckCircle2, Columns, FileText, Settings2, User, Type, Database, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AnimeBox } from '@/components/ui/AnimeBox';
import { useAdminDashboardVM } from '@/viewmodels/useAdminDashboardVM';
import { useAnalyticsVM } from '@/viewmodels/useAnalyticsVM';

export function AdminDashboard() {
  const [isSaving, setIsSaving] = useState(false);
  const [pickerModalOpen, setPickerModalOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    testList,
    attemptList,
    studentList,
    stuPrefix, setStuPrefix,
    stuCount, setStuCount,
    generatingStu, setGeneratingStu,
    stuMsg, setStuMsg,
    editId,
    rawMarkdown, setRawMarkdown,
    examTitle, setExamTitle,
    examDescription, setExamDescription,
    duration, setDuration,
    passingGrade, setPassingGrade,
    startAt, setStartAt,
    endAt, setEndAt,
    isDaily, setIsDaily,
    showAnswer, setShowAnswer,
    immediateFeedback, setImmediateFeedback,
    enableTipPenalty, setEnableTipPenalty,
    penaltyTheoryConfig, setPenaltyTheoryConfig,
    penaltyPracticeConfig, setPenaltyPracticeConfig,
    showSettings, setShowSettings,
    currentPreviewIdx, setCurrentPreviewIdx,
    slideDir, setSlideDir,
    saving,
    saveMsg,
    showPrintModal, setShowPrintModal,
    printColumns, setPrintColumns,
    printFontSize, setPrintFontSize,
    printGraphicScale, setPrintGraphicScale,
    showPrintDiscussion, setShowPrintDiscussion,
    printPaperSize, setPrintPaperSize,
    customPaperWidth, setCustomPaperWidth,
    customPaperHeight, setCustomPaperHeight,
    printShowHeader, setPrintShowHeader,
    printCustomTitle, setPrintCustomTitle,
    printSideBySide, setPrintSideBySide,
    printAnswersAtEnd, setPrintAnswersAtEnd,
    printAnswerStyle, setPrintAnswerStyle,
    printCompactLayout, setPrintCompactLayout,
    promptType, setPromptType,
    promptCount, setPromptCount,
    promptLang, setPromptLang,
    promptLevel, setPromptLevel,
    promptContext, setPromptContext,
    promptOther, setPromptOther,
    copiedPrompt,
    promptLabels, setPromptLabels,
    tipsRange, setTipsRange,
    isCustomTips, setIsCustomTips,
    questions,
    generatedPrompt,
    printDocumentStyle,
    handleGenerateStudents,
    handleDailyToggle,
    handleCreateNew,
    handleEdit,
    handleAnalytics,
    handleDelete,
    handleSave,
    handleCopyPrompt,
    loadAttempts,
    loadStudents,
    selectedTestId,
  } = useAdminDashboardVM();

  const copyTestLink = (testId: string) => {
    const url = `${window.location.origin}/exam/${testId}`;
    navigator.clipboard.writeText(url);
    alert(`Tautan Ujian Disalin:\n${url}`);
  };

  const executeWipe = async (action: string) => {
    setIsSaving(true);
    let err = null;
    if (action === 'WIPE_QUESTIONS') {
      const { error } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_TESTS') {
      const { error } = await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_ATTEMPTS') {
      const { error } = await supabase.from('attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_STUDENTS') {
      const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      err = error;
    } else if (action === 'WIPE_ALL') {
      await supabase.from('attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    setIsSaving(false);
    if (err) {
      alert(err.message);
    } else {
      alert('Eksekusi berhasil.');
    }
  };

  const handleSingleRegister = async (id: string, name: string) => {
    setGeneratingStu(true);
    const { error } = await supabase.from('students').insert([{ id, name }]);
    setGeneratingStu(false);
    if (error) {
      setStuMsg(error.message);
    } else {
      setStuMsg(`Siswa ${name} berhasil didaftarkan.`);
      loadStudents();
    }
  };

  const handleAddFromBankSoal = (selectedQuestions: any[]) => {
    let injectedText = '\n\n';
    selectedQuestions.forEach(q => {
      injectedText += `${q.body}\n\n`;
    });
    setRawMarkdown((prev: string) => prev + injectedText);
    setPickerModalOpen(false);
  };

  const { analysis, loading: analyticsLoading, error: analyticsError } = useAnalyticsVM(selectedTestId);

  return (
    <AnimeBox 
      preset="page"
      className="h-screen print:h-auto bg-background text-foreground flex flex-col"
    >
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex-none print:hidden">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">ExaPrep Admin</h1>
            <Badge variant="outline" className="rounded-lg border-border/60 font-medium">Dashboard</Badge>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'editor' && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setShowPrintModal(true)} className="rounded-xl font-semibold shadow-xs">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Ujian
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowSettings((v) => !v)} className="rounded-xl font-semibold border-border/60">
                  {showSettings ? 'Tutup Pengaturan' : 'Pengaturan'}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="rounded-xl font-semibold shadow-xs">
                  {saving ? 'Menyimpan...' : 'Simpan Ujian'}
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={() => window.location.href = '/'} className="rounded-xl font-semibold">
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* PRINT OVERLAY */}
      {showPrintModal && (
        <PrintModal
          onClose={() => setShowPrintModal(false)}
          printDocumentStyle={printDocumentStyle}
          printColumns={printColumns}
          setPrintColumns={setPrintColumns}
          printPaperSize={printPaperSize}
          setPrintPaperSize={setPrintPaperSize}
          customPaperWidth={customPaperWidth}
          setCustomPaperWidth={setCustomPaperWidth}
          customPaperHeight={customPaperHeight}
          setCustomPaperHeight={setCustomPaperHeight}
          showPrintDiscussion={showPrintDiscussion}
          setShowPrintDiscussion={setShowPrintDiscussion}
          printSideBySide={printSideBySide}
          setPrintSideBySide={setPrintSideBySide}
          printAnswersAtEnd={printAnswersAtEnd}
          setPrintAnswersAtEnd={setPrintAnswersAtEnd}
          printAnswerStyle={printAnswerStyle}
          setPrintAnswerStyle={setPrintAnswerStyle}
          printFontSize={printFontSize}
          setPrintFontSize={setPrintFontSize}
          printGraphicScale={printGraphicScale}
          setPrintGraphicScale={setPrintGraphicScale}
          printShowHeader={printShowHeader}
          setPrintShowHeader={setPrintShowHeader}
          printCompactLayout={printCompactLayout}
          setPrintCompactLayout={setPrintCompactLayout}
          printCustomTitle={printCustomTitle}
          setPrintCustomTitle={setPrintCustomTitle}
          examTitle={examTitle}
          duration={duration}
          questions={questions}
        />
      )}

      <div className="flex-1 flex overflow-hidden print:hidden relative">
        <aside className="w-16 md:w-64 border-r border-border/60 bg-card flex flex-col shrink-0 transition-all duration-300 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b border-border/60 hidden md:block">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu Navigasi</h2>
          </div>
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
            <Button
              variant={activeTab === 'tests' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('tests')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'tests' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <FileText className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Daftar Ujian</span>
            </Button>
            <Button
              variant={activeTab === 'bank' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('bank')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'bank' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <Database className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Bank Soal</span>
            </Button>
            <Button
              variant={activeTab === 'attempts' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('attempts')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'attempts' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <CheckCircle2 className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Hasil Peserta</span>
            </Button>
            <Button
              variant={activeTab === 'students' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('students')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'students' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <User className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Data Siswa</span>
            </Button>
            <Button
              variant={activeTab === 'editor' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('editor')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'editor' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <Settings2 className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">{editId ? 'Edit Ujian' : 'Editor Baru'}</span>
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'analytics' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <Columns className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Analisis Butir Soal</span>
            </Button>
            <Button
              variant={activeTab === 'prompt' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('prompt')}
              className={cn(
                "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-medium",
                activeTab === 'prompt' && "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              )}
            >
              <Type className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Prompt Generator</span>
            </Button>
            <div className="mt-8 border-t border-destructive/20 pt-4">
              <Button
                variant={activeTab === 'danger' ? 'destructive' : 'ghost'}
                onClick={() => setActiveTab('danger')}
                className={cn(
                  "w-full justify-start overflow-hidden transition-all active:scale-[0.98] rounded-xl font-semibold",
                  activeTab === 'danger' ? 'bg-destructive text-destructive-foreground shadow-xs' : 'text-destructive hover:bg-destructive/10'
                )}
              >
                <AlertTriangle className="w-4 h-4 md:mr-2 shrink-0" /> <span className="hidden md:inline truncate">Danger Zone</span>
              </Button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-muted/10 custom-scrollbar relative z-10">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="h-full flex flex-col">
            <TabsList className="hidden">
              <TabsTrigger value="tests">1</TabsTrigger>
              <TabsTrigger value="attempts">2</TabsTrigger>
              <TabsTrigger value="students">3</TabsTrigger>
              <TabsTrigger value="editor">4</TabsTrigger>
              <TabsTrigger value="prompt">5</TabsTrigger>
              <TabsTrigger value="bank">6</TabsTrigger>
              <TabsTrigger value="danger">7</TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="flex-1 h-full">
              <BankSoalTab />
            </TabsContent>

            <TabsContent value="danger" className="flex-1 h-full">
              <DangerZoneTab onExecuteWipe={executeWipe} isSaving={isSaving} />
            </TabsContent>

            <TabsContent value="tests" className="flex-1">
              <TestsTab
                testList={testList}
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAnalytics={handleAnalytics}
                onCopyLink={copyTestLink}
              />
            </TabsContent>

            <TabsContent value="attempts" className="flex-1">
              <AttemptsTab attemptList={attemptList} onRefresh={loadAttempts} />
            </TabsContent>

            <TabsContent value="students" className="flex-1">
              <StudentsTab
                studentList={studentList}
                stuPrefix={stuPrefix}
                setStuPrefix={setStuPrefix}
                stuCount={stuCount}
                setStuCount={setStuCount}
                generatingStu={generatingStu}
                stuMsg={stuMsg}
                onGenerateStudents={handleGenerateStudents}
                onRefresh={loadStudents}
                onSingleRegister={handleSingleRegister}
              />
            </TabsContent>

            <TabsContent value="analytics" className="flex-1">
              <AnalyticsTab
                analysis={analysis}
                loading={analyticsLoading}
                error={analyticsError}
                onBackToTests={() => setActiveTab('tests')}
              />
            </TabsContent>

            <TabsContent value="editor" className="flex-1">
              <EditorTab
                editId={editId}
                examTitle={examTitle}
                setExamTitle={setExamTitle}
                examDescription={examDescription}
                setExamDescription={setExamDescription}
                duration={duration}
                setDuration={setDuration}
                passingGrade={passingGrade}
                setPassingGrade={setPassingGrade}
                startAt={startAt}
                setStartAt={setStartAt}
                endAt={endAt}
                setEndAt={setEndAt}
                isDaily={isDaily}
                setIsDaily={setIsDaily}
                handleDailyToggle={handleDailyToggle}
                showAnswer={showAnswer}
                setShowAnswer={setShowAnswer}
                immediateFeedback={immediateFeedback}
                setImmediateFeedback={setImmediateFeedback}
                enableTipPenalty={enableTipPenalty}
                setEnableTipPenalty={setEnableTipPenalty}
                penaltyTheoryConfig={penaltyTheoryConfig}
                setPenaltyTheoryConfig={setPenaltyTheoryConfig}
                penaltyPracticeConfig={penaltyPracticeConfig}
                setPenaltyPracticeConfig={setPenaltyPracticeConfig}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                rawMarkdown={rawMarkdown}
                setRawMarkdown={setRawMarkdown}
                questions={questions}
                currentPreviewIdx={currentPreviewIdx}
                setCurrentPreviewIdx={setCurrentPreviewIdx}
                slideDir={slideDir}
                setSlideDir={setSlideDir}
                saveMsg={saveMsg}
                onOpenBankPicker={() => setPickerModalOpen(true)}
              />
            </TabsContent>

            <TabsContent value="prompt" className="flex-1">
              <PromptTab
                promptType={promptType}
                setPromptType={setPromptType}
                promptCount={promptCount}
                setPromptCount={setPromptCount}
                promptLang={promptLang}
                setPromptLang={setPromptLang}
                promptLevel={promptLevel}
                setPromptLevel={setPromptLevel}
                promptContext={promptContext}
                setPromptContext={setPromptContext}
                promptOther={promptOther}
                setPromptOther={setPromptOther}
                promptLabels={promptLabels}
                setPromptLabels={setPromptLabels}
                tipsRange={tipsRange}
                setTipsRange={setTipsRange}
                isCustomTips={isCustomTips}
                setIsCustomTips={setIsCustomTips}
                generatedPrompt={generatedPrompt}
                copiedPrompt={copiedPrompt}
                onCopyPrompt={handleCopyPrompt}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {pickerModalOpen && (
        <BankSoalPickerModal 
          onClose={() => setPickerModalOpen(false)} 
          onAddSelected={handleAddFromBankSoal} 
        />
      )}
    </AnimeBox>
  );
}
