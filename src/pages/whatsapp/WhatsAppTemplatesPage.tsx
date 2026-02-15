import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Loader2, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { TemplateKPIs } from '@/components/whatsapp/templates/TemplateKPIs';
import { TemplateFiltersBar } from '@/components/whatsapp/templates/TemplateFiltersBar';
import { TemplatesTable } from '@/components/whatsapp/templates/TemplatesTable';
import { TemplateEditor } from '@/components/whatsapp/templates/TemplateEditor';
import { TemplateDetailsView } from '@/components/whatsapp/templates/TemplateDetailsView';
import { TemplatePagination } from '@/components/whatsapp/templates/TemplatePagination';
import { SendTestDialog } from '@/components/whatsapp/templates/SendTestDialog';
import { WhatsAppSettingsModal } from '@/components/whatsapp/WhatsAppSettingsModal';
import { 
  useWhatsAppTemplates, 
  type WATemplate, 
  type TemplateFilters,
  type TemplateEvent
} from '@/hooks/useWhatsAppTemplates';

export default function WhatsAppTemplatesPage() {
  const navigate = useNavigate();
  // Filters state
  const [filters, setFilters] = useState<TemplateFilters>({
    page: 1,
    limit: 20,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  });

  // UI state
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sendTestOpen, setSendTestOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WATemplate | null>(null);
  const [templateEvents, setTemplateEvents] = useState<TemplateEvent[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const {
    templates,
    total,
    stats,
    isLoading,
    refetch,
    getTemplate,
    createTemplate,
    updateTemplate,
    submitToMeta,
    syncFromMeta,
    deleteTemplate,
    sendTest,
    isCreating,
    isUpdating,
    isSubmitting,
    isSyncing,
    isDeleting,
    isSendingTest,
  } = useWhatsAppTemplates(filters);

  const totalPages = Math.ceil(total / filters.limit);

  const handleFiltersChange = useCallback((newFilters: Partial<TemplateFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleView = useCallback(async (template: WATemplate) => {
    setSelectedTemplate(template);
    setDetailsOpen(true);
    setIsLoadingDetails(true);
    try {
      const result = await getTemplate(template.id);
      setSelectedTemplate(result.template);
      setTemplateEvents(result.events);
    } catch (e) {
      console.error('Failed to load template details:', e);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [getTemplate]);

  const handleEdit = useCallback((template: WATemplate) => {
    setSelectedTemplate(template);
    setDetailsOpen(false);
    setEditorOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedTemplate(null);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(async (data: Partial<WATemplate>) => {
    if (data.id) {
      await updateTemplate(data as any);
    } else {
      await createTemplate(data);
    }
  }, [createTemplate, updateTemplate]);

  const handleSubmit = useCallback(async (template: WATemplate) => {
    await submitToMeta(template.id);
  }, [submitToMeta]);

  const handleDelete = useCallback(async (template: WATemplate) => {
    await deleteTemplate(template.id);
    setDetailsOpen(false);
  }, [deleteTemplate]);

  const handleSendTest = useCallback((template: WATemplate) => {
    setSelectedTemplate(template);
    setSendTestOpen(true);
  }, []);

  const handleSendTestSubmit = useCallback(async (
    templateId: string, 
    phone: string, 
    parameters?: { header?: string[]; body?: string[] }
  ) => {
    await sendTest({ id: templateId, phone, parameters });
    setSendTestOpen(false);
  }, [sendTest]);

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إدارة قوالب الرسائل وإرسالها للموافقة من Meta
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/whatsapp/logs')}
            title="سجل المراسلات"
          >
            <FileText className="h-4 w-4 ml-2" />
            السجل
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSettingsOpen(true)}
            title="إعدادات API"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => syncFromMeta()} 
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 ml-2" />
            )}
            Sync
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 ml-2" />
            Create
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <TemplateKPIs stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <TemplateFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <TemplatesTable
        templates={templates}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        onSendTest={handleSendTest}
      />

      {/* Pagination */}
      <TemplatePagination
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(page) => handleFiltersChange({ page })}
      />

      {/* Editor Drawer */}
      <TemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={selectedTemplate}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      {/* Details View */}
      <TemplateDetailsView
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        template={selectedTemplate}
        events={templateEvents}
        isLoading={isLoadingDetails}
        onEdit={() => {
          setDetailsOpen(false);
          setEditorOpen(true);
        }}
        onSubmit={() => selectedTemplate && submitToMeta(selectedTemplate.id)}
        onDelete={() => selectedTemplate && handleDelete(selectedTemplate)}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
      />

      {/* Send Test Dialog */}
      <SendTestDialog
        open={sendTestOpen}
        onOpenChange={setSendTestOpen}
        template={selectedTemplate}
        onSend={handleSendTestSubmit}
        isSending={isSendingTest}
      />

      {/* Settings Modal */}
      <WhatsAppSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </PageContainer>
  );
}
