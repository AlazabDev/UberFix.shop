import { CodeReviewService, CodeIssue, CodeReviewResult } from '../src/services/codeReviewService';
import * as fs from 'fs';
import * as path from 'path';

interface ProjectScanResult {
  files: string[];
  structure: string;
  totalLines: number;
}

class ProjectCodeReview {
  private projectRoot: string;
  private ignoredDirs = ['node_modules', '.git', 'dist', 'build', '.next'];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async scanProject(): Promise<ProjectScanResult> {
    const files: string[] = [];
    let structure = '';
    let totalLines = 0;

    const scanDir = (dir: string, depth: number = 0) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (this.ignoredDirs.includes(item)) continue;

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          structure += '  '.repeat(depth) + `📁 ${item}\n`;
          scanDir(fullPath, depth + 1);
        } else if (this.isCodeFile(item)) {
          files.push(fullPath);
          structure += '  '.repeat(depth) + `📄 ${item}\n`;
          
          // حساب عدد الأسطر
          const content = fs.readFileSync(fullPath, 'utf-8');
          totalLines += content.split('\n').length;
        }
      }
    };

    scanDir(this.projectRoot);
    return { files, structure, totalLines };
  }

  async performComprehensiveReview(): Promise<CodeReviewResult> {
    console.warn('🚀 بدء المراجعة الشاملة للمشروع...\n');

    // مسح المشروع
    const scanResult = await this.scanProject();
    console.warn(`📊 إحصائيات المشروع:`);
    console.warn(`   📁 عدد الملفات: ${scanResult.files.length}`);
    console.warn(`   📝 إجمالي الأسطر: ${scanResult.totalLines}`);
    console.warn(`   🏗️ هيكل المشروع مُجهز\n`);

    // مراجعة هيكل المشروع
    console.warn('🔍 مراجعة هيكل المشروع...');
    const structureReview = await CodeReviewService.reviewProjectStructure(scanResult.structure);
    
    // مراجعة الملفات الفردية
    console.warn('📄 مراجعة الملفات البرمجية...');
    const allIssues: CodeIssue[] = [];
    
    for (const file of scanResult.files.slice(0, 10)) { // تحد من عدد الملفات للاختبار
      console.warn(`   📋 مراجعة: ${path.relative(this.projectRoot, file)}`);
      const content = fs.readFileSync(file, 'utf-8');
      const issues = await CodeReviewService.reviewFile(file, content);
      allIssues.push(...issues);
    }

    // إنشاء التقرير النهائي
    const result: CodeReviewResult = {
      issues: allIssues,
      summary: {
        totalFiles: scanResult.files.length,
        filesWithIssues: new Set(allIssues.map(issue => issue.file)).size,
        totalIssues: allIssues.length,
        errors: allIssues.filter(issue => issue.severity === 'error').length,
        warnings: allIssues.filter(issue => issue.severity === 'warning').length,
        info: allIssues.filter(issue => issue.severity === 'info').length
      },
      recommendations: structureReview.recommendations,
      score: this.calculateScore(allIssues, scanResult.files.length)
    };

    return result;
  }

  generateReport(result: CodeReviewResult): string {
    let report = `# 📊 تقرير مراجعة الكود الشامل\n\n`;
    
    report += `## 📈 الملخص العام\n`;
    report += `- **إجمالي الملفات**: ${result.summary.totalFiles}\n`;
    report += `- **الملفات ذات المشاكل**: ${result.summary.filesWithIssues}\n`;
    report += `- **إجمالي المشاكل**: ${result.summary.totalIssues}\n`;
    report += `- **الأخطاء**: ${result.summary.errors} ❌\n`;
    report += `- **تحذيرات**: ${result.summary.warnings} ⚠️\n`;
    report += `- **ملاحظات**: ${result.summary.info} 💡\n`;
    report += `- **التقييم العام**: ${result.score}/100 ⭐\n\n`;

    if (result.issues.length > 0) {
      report += `## 🔍 المشاكل المكتشفة\n\n`;
      
      const byFile = this.groupIssuesByFile(result.issues);
      for (const [file, issues] of Object.entries(byFile)) {
        report += `### 📄 ${path.relative(this.projectRoot, file)}\n`;
        
        for (const issue of issues) {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : '💡';
          report += `${icon} **${issue.severity.toUpperCase()}** - السطر ${issue.line}\n`;
          report += `   **المشكلة**: ${issue.message}\n`;
          if (issue.suggestion) {
            report += `   **الاقتراح**: ${issue.suggestion}\n`;
          }
          report += `   **التصنيف**: ${issue.category}\n\n`;
        }
      }
    }

    if (result.recommendations.length > 0) {
      report += `## 💡 التوصيات العامة\n\n`;
      result.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    report += `\n## 🎯 خطة الإصلاح\n\n`;
    report += `1. **معالجة الأخطاء الحرجة أولاً** (${result.summary.errors} خطأ)\n`;
    report += `2. **معالجة التحذيرات المهمة** (${result.summary.warnings} تحذير)\n`;
    report += `3. **تحسين هيكل المشروع**\n`;
    report += `4. **تحسين الأداء والأمان**\n`;
    report += `5. **تحسين قابلية الصيانة**\n`;

    return report;
  }

  private isCodeFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.css', '.scss', '.html', '.json'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  private calculateScore(issues: CodeIssue[], totalFiles: number): number {
    if (totalFiles === 0) return 100;

    const errorPenalty = issues.filter(i => i.severity === 'error').length * 10;
    const warningPenalty = issues.filter(i => i.severity === 'warning').length * 3;
    const infoPenalty = issues.filter(i => i.severity === 'info').length * 1;

    const totalPenalty = errorPenalty + warningPenalty + infoPenalty;
    const maxPenalty = totalFiles * 15; // عقوبة قصوى افتراضية

    return Math.max(0, 100 - (totalPenalty / maxPenalty) * 100);
  }

  private groupIssuesByFile(issues: CodeIssue[]): { [file: string]: CodeIssue[] } {
    return issues.reduce((groups, issue) => {
      if (!groups[issue.file]) {
        groups[issue.file] = [];
      }
      groups[issue.file].push(issue);
      return groups;
    }, {} as { [file: string]: CodeIssue[] });
  }
}

// التنفيذ الرئيسي
async function main() {
  const reviewer = new ProjectCodeReview();
  
  try {
    const result = await reviewer.performComprehensiveReview();
    const report = reviewer.generateReport(result);
    
    // حفظ التقرير
    const reportPath = path.join(process.cwd(), 'code-review-report.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.warn('\n✅ تم إنشاء التقرير بنجاح!');
    console.warn(`📄 التقرير محفوظ في: ${reportPath}`);
    
    // عرض ملخص في الكونسول
    console.warn('\n📊 ملخص سريع:');
    console.warn(`   التقييم: ${result.score}/100`);
    console.warn(`   الأخطاء: ${result.summary.errors}`);
    console.warn(`   التحذيرات: ${result.summary.warnings}`);
    console.warn(`   الملفات المفحوصة: ${result.summary.totalFiles}`);
    
  } catch (error) {
    console.error('❌ فشل في تنفيذ المراجعة:', error);
  }
}

// تشغيل السكريبت إذا تم استدعائه مباشرة
if (require.main === module) {
  main();
}

export { ProjectCodeReview };
