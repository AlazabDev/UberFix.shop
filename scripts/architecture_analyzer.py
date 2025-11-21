#!/usr/bin/env python3
"""
UberFix Architecture Analyzer
تحليل متقدم للهيكل والوظائف والروابط بين المكونات
"""

import os
import re
import json
import ast
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any
from collections import defaultdict
import datetime

class UberFixArchitectureAnalyzer:
    def __init__(self):
        self.project_root = Path("/opt/UberFix")
        self.analysis_result = {
            'project_info': {},
            'file_structure': {},
            'functions_analysis': {},
            'dependencies_graph': {},
            'components_relationships': {},
            'architecture_issues': [],
            'recommendations': []
        }
        
        # أنماط الملفات والمجلدات
        self.folder_descriptions = {
            'src': 'المجلد الرئيسي للكود المصدري',
            'src/components': 'مكونات React القابلة لإعادة الاستخدام',
            'src/pages': 'صفحات التطبيق الرئيسية',
            'src/hooks': 'React hooks مخصصة',
            'src/lib': 'أدوات ووظائف مساعدة',
            'src/config': 'ملفات الإعدادات والتكوين',
            'src/data': 'ملفات البيانات والثوابت',
            'src/routes': 'إعدادات التوجيه والمسارات',
            'src/integrations': 'تكاملات الخدمات الخارجية',
            'public': 'الملفات العامة والثابتة',
            'public/icons': 'أيقوانات التطبيق',
            'public/img': 'الصور والوسائط',
            'public/logo': 'شعارات التطبيق',
            'scripts': 'سكريبتات التشغيل والبناء',
            'docs': 'الوثائق والتوثيق',
            'e2e': 'اختبارات End-to-End',
            'android': 'كود تطبيق Android',
            'supabase': 'إعدادات وقواعد بيانات Supabase',
            '.github': 'إعدادات GitHub Actions'
        }
        
        self.file_patterns = {
            'react_component': r'\.(tsx|jsx)$',
            'typescript': r'\.(ts|tsx)$',
            'javascript': r'\.(js|jsx)$',
            'stylesheet': r'\.(css|scss)$',
            'config': r'\.(config\.(ts|js)|json)$',
            'test': r'\.(test|spec)\.(ts|tsx|js|jsx)$'
        }

    def analyze_project_structure(self) -> Dict:
        """تحليل هيكل المشروع بالكامل"""
        print("🏗️  تحليل هيكل مشروع UberFix...")
        
        structure = {}
        
        for root, dirs, files in os.walk(self.project_root):
            # تجاهل المجلدات غير المرغوبة
            dirs[:] = [d for d in dirs if d not in ['node_modules', 'dist', 'build', '.git', 'backups']]
            
            relative_path = Path(root).relative_to(self.project_root)
            if relative_path == Path('.'):
                folder_key = 'ROOT'
            else:
                folder_key = str(relative_path)
            
            structure[folder_key] = {
                'type': 'directory',
                'description': self.folder_descriptions.get(folder_key, ''),
                'files': [],
                'subfolders': []
            }
            
            # تحليل الملفات
            for file in files:
                file_path = Path(root) / file
                file_info = self.analyze_file(file_path)
                structure[folder_key]['files'].append(file_info)
            
            # إضافة المجلدات الفرعية
            for dir_name in dirs:
                structure[folder_key]['subfolders'].append(dir_name)
        
        self.analysis_result['file_structure'] = structure
        return structure

    def analyze_file(self, file_path: Path) -> Dict:
        """تحليل ملف مفصل"""
        file_info = {
            'name': file_path.name,
            'path': str(file_path.relative_to(self.project_root)),
            'type': self.detect_file_type(file_path),
            'size': file_path.stat().st_size,
            'functions': [],
            'imports': [],
            'exports': [],
            'description': self.get_file_description(file_path)
        }
        
        # تحليل المحتوى بناءً على نوع الملف
        if file_info['type'] in ['react_component', 'typescript', 'javascript']:
            content_analysis = self.analyze_code_file(file_path)
            file_info.update(content_analysis)
        
        return file_info

    def detect_file_type(self, file_path: Path) -> str:
        """كشف نوع الملف"""
        name = file_path.name
        
        for pattern_type, pattern in self.file_patterns.items():
            if re.search(pattern, name):
                return pattern_type
        
        return 'other'

    def get_file_description(self, file_path: Path) -> str:
        """الحصول على وصف الملف"""
        relative_path = str(file_path.relative_to(self.project_root))
        name = file_path.name
        
        # وصف الملفات الرئيسية
        file_descriptions = {
            'package.json': 'إعدادات المشروع والحزم',
            'vite.config.ts': 'إعدادات بيئة التطوير Vite',
            'tsconfig.json': 'إعدادات TypeScript',
            'tailwind.config.ts': 'إعدادات Tailwind CSS',
            'capacitor.config.ts': 'إعدادات تطبيق الجوال',
            'src/main.tsx': 'نقطة دخول التطبيق',
            'src/App.tsx': 'المكون الرئيسي للتطبيق',
            'src/App.css': 'أنماط المكون الرئيسي',
            'index.html': 'الصفحة الرئيسية HTML'
        }
        
        # وصف الملفات حسب المسار
        path_descriptions = {
            'src/components/auth': 'مكونات المصادقة والتسجيل',
            'src/components/dashboard': 'مكونات لوحة التحكم',
            'src/components/maintenance': 'مكونات إدارة الصيانة',
            'src/components/ui': 'مكونات واجهة المستخدم الأساسية',
            'src/hooks': 'React hooks مخصصة',
            'src/pages/admin': 'صفحات إدارة النظام',
            'src/pages/maintenance': 'صفحات إدارة طلبات الصيانة',
            'src/lib': 'أدوات ووظائف مساعدة'
        }
        
        # البحث عن الوصف المناسب
        for path_pattern, description in path_descriptions.items():
            if path_pattern in relative_path:
                return description
        
        return file_descriptions.get(name, '')

    def analyze_code_file(self, file_path: Path) -> Dict:
        """تحليل ملف الكود لاكتشاف الوظائف والواردات"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            analysis = {
                'functions': self.extract_functions(content, file_path),
                'imports': self.extract_imports(content),
                'exports': self.extract_exports(content),
                'dependencies': self.extract_dependencies(content),
                'lines_of_code': len(content.splitlines())
            }
            
            return analysis
            
        except Exception as e:
            return {
                'functions': [],
                'imports': [],
                'exports': [],
                'dependencies': [],
                'lines_of_code': 0,
                'error': str(e)
            }

    def extract_functions(self, content: str, file_path: Path) -> List[Dict]:
        """استخراج الوظائف من الكود"""
        functions = []
        
        # أنماط التعرف على الوظائف
        patterns = [
            # React function components
            (r'const\s+(\w+)\s*=\s*\(\s*(.*?)\s*\)\s*:\s*(\w+)\s*=>\s*{', 'react_component'),
            (r'function\s+(\w+)\s*\(\s*(.*?)\s*\)\s*{', 'function'),
            (r'export\s+const\s+(\w+)\s*=\s*\(\s*(.*?)\s*\)\s*=>\s*{', 'react_component'),
            # Arrow functions
            (r'const\s+(\w+)\s*=\s*\(\s*(.*?)\s*\)\s*=>\s*{', 'arrow_function'),
            # Hook patterns
            (r'const\s+use(\w+)\s*=\s*\(\s*(.*?)\s*\)\s*=>\s*{', 'custom_hook')
        ]
        
        for pattern, func_type in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                func_name = match.group(1)
                params = match.group(2) if len(match.groups()) > 1 else ''
                
                functions.append({
                    'name': func_name,
                    'type': func_type,
                    'parameters': params,
                    'file': str(file_path.relative_to(self.project_root)),
                    'description': self.get_function_description(func_name, func_type, file_path)
                })
        
        return functions

    def get_function_description(self, func_name: str, func_type: str, file_path: Path) -> str:
        """الحصول على وصف الوظيفة"""
        relative_path = str(file_path.relative_to(self.project_root))
        
        # أوصاف بناءً على النمط
        if func_type == 'react_component':
            return f'مكون React لعرض واجهة المستخدم'
        elif func_type == 'custom_hook' and func_name.startswith('use'):
            hook_name = func_name[3:]  # إزالة use
            return f'Hook مخصص لإدارة حالة {hook_name}'
        elif 'handler' in func_name.lower():
            return 'معالج الأحداث والتفاعلات'
        elif 'get' in func_name.lower():
            return 'وظيفة جلب البيانات'
        elif 'set' in func_name.lower():
            return 'وظيفة تعيين البيانات'
        elif 'update' in func_name.lower():
            return 'وظيفة تحديث البيانات'
        elif 'delete' in func_name.lower():
            return 'وظيفة حذف البيانات'
        
        return 'وظيفة تنفيذية'

    def extract_imports(self, content: str) -> List[Dict]:
        """استخراج الواردات من الكود"""
        imports = []
        
        # أنماط الاستيراد
        patterns = [
            (r'import\s+(.*?)\s+from\s+[\'"](.*?)[\'"]', 'named_import'),
            (r'import\s+\*\s+as\s+(\w+)\s+from\s+[\'"](.*?)[\'"]', 'namespace_import'),
            (r'import\s+[\'"](.*?)[\'"]', 'default_import')
        ]
        
        for pattern, import_type in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                imports.append({
                    'type': import_type,
                    'source': match.group(2) if len(match.groups()) > 1 else match.group(1),
                    'elements': match.group(1) if import_type == 'named_import' else ''
                })
        
        return imports

    def extract_exports(self, content: str) -> List[Dict]:
        """استخراج الصادرات من الكود"""
        exports = []
        
        patterns = [
            (r'export\s+const\s+(\w+)', 'named_export'),
            (r'export\s+function\s+(\w+)', 'function_export'),
            (r'export\s+default\s+(\w+)', 'default_export'),
            (r'export\s+{\s*(.*?)\s*}', 'multi_export')
        ]
        
        for pattern, export_type in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                exports.append({
                    'type': export_type,
                    'elements': match.group(1)
                })
        
        return exports

    def extract_dependencies(self, content: str) -> List[str]:
        """استخراج التبعيات من الكود"""
        dependencies = set()
        
        # البحث عن استخدام المكتبات
        lib_patterns = [
            r'supabase\.(\w+)',
            r'useState|useEffect|useContext',
            r'axios\.(\w+)',
            r'fetch\(|\.fetch\(',
            r'localStorage\.',
            r'sessionStorage\.'
        ]
        
        for pattern in lib_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                dependencies.add(match.group(0))
        
        return list(dependencies)

    def analyze_function_relationships(self):
        """تحليل العلاقات بين الوظائف"""
        print("🔗 تحليل العلاقات بين الوظائف...")
        
        functions_graph = {}
        all_functions = []
        
        # جمع كل الوظائف من جميع الملفات
        for folder, info in self.analysis_result['file_structure'].items():
            for file_info in info['files']:
                if 'functions' in file_info:
                    for func in file_info['functions']:
                        func_id = f"{file_info['path']}::{func['name']}"
                        all_functions.append({
                            'id': func_id,
                            **func
                        })
        
        # تحليل العلاقات
        for func in all_functions:
            func_id = func['id']
            functions_graph[func_id] = {
                'function': func,
                'calls': [],
                'called_by': [],
                'dependencies': []
            }
        
        self.analysis_result['functions_analysis'] = functions_graph

    def generate_architecture_report(self) -> str:
        """توليد تقرير معماري مفصل"""
        report = [
            "=" * 80,
            "🏗️  تقرير التحليل المعماري - UberFix",
            "=" * 80,
            f"وقت التوليد: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            ""
        ]
        
        # معلومات المشروع
        report.extend([
            "📊 معلومات المشروع:",
            "-" * 40
        ])
        
        total_files = 0
        total_functions = 0
        
        for folder, info in self.analysis_result['file_structure'].items():
            total_files += len(info['files'])
            for file_info in info['files']:
                total_functions += len(file_info.get('functions', []))
        
        report.extend([
            f"📁 إجمالي الملفات: {total_files}",
            f"🔧 إجمالي الوظائف: {total_functions}",
            f"📂 إجمالي المجلدات: {len(self.analysis_result['file_structure'])}",
            ""
        ])
        
        # الهيكل التنظيمي
        report.extend([
            "📁 الهيكل التنظيمي للمشروع:",
            "-" * 40,
            ""
        ])
        
        for folder, info in sorted(self.analysis_result['file_structure'].items()):
            indent = "  " * (folder.count('/') + 1)
            if folder == 'ROOT':
                report.append("📦 / (المجلد الرئيسي)")
            else:
                report.append(f"{indent}📁 {folder}")
            
            if info['description']:
                report.append(f"{indent}  📝 {info['description']}")
            
            for file_info in info['files']:
                file_indent = "  " * (folder.count('/') + 2)
                file_icon = "📄" if file_info['type'] == 'other' else "⚛️" if file_info['type'] == 'react_component' else "📜"
                report.append(f"{file_indent}{file_icon} {file_info['name']}")
                
                if file_info['description']:
                    report.append(f"{file_indent}  📝 {file_info['description']}")
                
                # عرض الوظائف إذا وجدت
                if file_info.get('functions'):
                    for func in file_info['functions']:
                        func_indent = "  " * (folder.count('/') + 3)
                        func_icon = "🔧" if func['type'] == 'function' else "⚡" if func['type'] == 'react_component' else "🎣"
                        report.append(f"{func_indent}{func_icon} {func['name']} - {func['description']}")
            
            report.append("")
        
        # التوصيات
        report.extend([
            "💡 التوصيات المعمارية:",
            "-" * 40,
            ""
        ])
        
        recommendations = [
            "✅ فصل منطق الأعمال عن مكونات العرض",
            "✅ استخدام TypeScript بشكل صارم للأنواع",
            "✅ تنظيم الـ hooks في مجلدات متخصصة",
            "✅ توحيد أنماط تسمية الملفات والوظائف",
            "✅ إضافة توثيق للوظائف المعقدة",
            "✅ تحسين هيكل الاستيراد والتصدير"
        ]
        
        for rec in recommendations:
            report.append(f"  {rec}")
        
        report.extend([
            "",
            "=" * 80,
            "🎯 تم الإنتهاء من التحليل المعماري",
            "=" * 80
        ])
        
        return '\n'.join(report)

    def export_to_json(self, output_path: Path):
        """تصدير النتائج إلى JSON"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.analysis_result, f, ensure_ascii=False, indent=2)

    def run_complete_analysis(self):
        """تشغيل التحليل الكامل"""
        print("🚀 بدء التحليل المعماري الشامل لـ UberFix...")
        print("=" * 60)
        
        # 1. تحليل الهيكل
        self.analyze_project_structure()
        
        # 2. تحليل العلاقات
        self.analyze_function_relationships()
        
        # 3. توليد التقرير
        report = self.generate_architecture_report()
        
        # 4. حفظ التقرير في مجلد reports/
        reports_dir = self.project_root / "reports"
        reports_dir.mkdir(exist_ok=True)
        
        report_path = reports_dir / f"architecture_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        # 5. تصدير JSON في مجلد reports/
        json_path = reports_dir / f"architecture_data_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        self.export_to_json(json_path)
        
        print("\n" + "=" * 60)
        print("📊 نتائج التحليل:")
        print("=" * 60)
        print(f"📄 التقرير النصي: {report_path}")
        print(f"📊 البيانات الخام: {json_path}")
        print("\n" + "=" * 60)
        
        # عرض ملخص التقرير
        print("\n📋 ملخص التقرير:")
        print("-" * 40)
        for line in report.split('\n')[:30]:  # أول 30 سطر
            print(line)

def main():
    analyzer = UberFixArchitectureAnalyzer()
    analyzer.run_complete_analysis()

if __name__ == "__main__":
    main()