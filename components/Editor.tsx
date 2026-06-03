"use client";

import {
  BlockNoteEditor,
  BlockSchema,
  PartialBlock,
  defaultBlockSchema,
} from "@blocknote/core";
import {
  BlockNoteView,
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  useBlockNote,
} from "@blocknote/react";
import "@blocknote/core/style.css";
import { BarChart3, Plus } from "lucide-react";
import { useTheme } from "next-themes";

import {
  defaultChartValue,
  DocumentChart,
  parseTableInput,
  type ChartBlockValue,
} from "@/components/DocumentChart";
import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

type ChartBlockProps = {
  title: string;
  chartType: string;
  data: string;
  colors: string;
  showLegend: boolean;
};

const serializeChart = (value: ChartBlockValue): ChartBlockProps => ({
  title: value.title,
  chartType: value.chartType,
  data: JSON.stringify(value.data),
  colors: value.colors.join(","),
  showLegend: value.showLegend,
});

const deserializeChart = (props: ChartBlockProps): ChartBlockValue => {
  let data = defaultChartValue.data;

  try {
    const parsed = JSON.parse(props.data ?? "[]");
    if (Array.isArray(parsed)) {
      data = parsed
        .map((item) => ({
          name: String(item?.name ?? ""),
          value: Number(item?.value ?? 0),
        }))
        .filter((item) => item.name.length > 0);
    }
  } catch {
    data = defaultChartValue.data;
  }

  return {
    title: props.title || defaultChartValue.title,
    chartType: (props.chartType || defaultChartValue.chartType) as ChartBlockValue["chartType"],
    showLegend: props.showLegend ?? true,
    colors: props.colors
      ? props.colors.split(",").map((color) => color.trim()).filter(Boolean)
      : defaultChartValue.colors,
    data: data.length > 0 ? data : defaultChartValue.data,
  };
};

const insertOrUpdateBlock = <BSchema extends BlockSchema>(
  editor: BlockNoteEditor<BSchema>,
  block: PartialBlock<BSchema>
) => {
  const currentBlock = editor.getTextCursorPosition().block;
  if (
    currentBlock.content &&
    ((currentBlock.content.length === 1 &&
      currentBlock.content[0].type === "text" &&
      currentBlock.content[0].text === "/") ||
      currentBlock.content.length === 0)
  ) {
    editor.updateBlock(currentBlock, block);
    return;
  }

  editor.insertBlocks([block], currentBlock, "after");
  const nextBlock = editor.getTextCursorPosition().nextBlock;
  if (nextBlock) {
    editor.setTextCursorPosition(nextBlock);
  }
};

const detectChartDataFromDocument = (editor: BlockNoteEditor<any>) => {
  const topBlocks = editor.topLevelBlocks;

  for (const block of topBlocks) {
    const asAny = block as any;

    if (asAny?.type === "table" && Array.isArray(asAny?.content?.rows)) {
      const rows = asAny.content.rows as Array<{ cells: Array<{ content: string }> }>;
      const parsed = rows
        .slice(1)
        .map((row) => ({
          name: String(row.cells?.[0]?.content ?? "").trim(),
          value: Number(String(row.cells?.[1]?.content ?? "0").replace(",", ".")),
        }))
        .filter((item) => item.name && Number.isFinite(item.value));

      if (parsed.length > 0) return parsed;
    }

    if (asAny?.type === "paragraph" && Array.isArray(asAny?.content)) {
      const line = asAny.content.map((item: any) => item?.text ?? "").join("").trim();
      if (line.includes("|") || line.includes(",") || line.includes("\t")) {
        const parsed = parseTableInput(line);
        if (parsed.length > 0) {
          return parsed;
        }
      }
    }
  }

  return [];
};

const chartBlock = createReactBlockSpec<
  "chart",
  {
    title: { default: string };
    chartType: { default: string };
    data: { default: string };
    colors: { default: string };
    showLegend: { default: boolean };
  },
  false,
  typeof defaultBlockSchema
>({
  type: "chart",
  propSchema: {
    title: { default: defaultChartValue.title },
    chartType: { default: defaultChartValue.chartType },
    data: { default: JSON.stringify(defaultChartValue.data) },
    colors: { default: defaultChartValue.colors.join(",") },
    showLegend: { default: true },
  },
  containsInlineContent: false,
  render: ({ block, editor }) => {
    const typedEditor = editor as BlockNoteEditor<any>;
    const value = deserializeChart(block.props as unknown as ChartBlockProps);

    return (
      <DocumentChart
        value={value}
        editable={typedEditor.isEditable}
        onChange={(next) => {
          typedEditor.updateBlock(block as any, {
            type: "chart",
            props: serializeChart(next),
          } as any);
        }}
      />
    );
  },
});

const blockSchema = {
  ...defaultBlockSchema,
  chart: chartBlock,
} as const;

function Editor({ onChange, initialContent, editable = true }: EditorProps) {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  const editor = useBlockNote({
    editable,
    blockSchema,
    slashMenuItems: [
      ...getDefaultReactSlashMenuItems(blockSchema),
      {
        name: "Chart",
        group: "Basic blocks",
        icon: <BarChart3 className="h-4 w-4" />,
        hint: "Insert bar, line or pie chart",
        aliases: ["chart", "diagram", "graph"],
        execute: (editorInstance) => {
          const extracted = detectChartDataFromDocument(editorInstance as BlockNoteEditor<any>);
          const value = {
            ...defaultChartValue,
            data: extracted.length > 0 ? extracted : defaultChartValue.data,
          };
          insertOrUpdateBlock(editorInstance, {
            type: "chart",
            props: serializeChart(value),
          } as PartialBlock<any>);
        },
      },
    ],
    initialContent: initialContent ? (JSON.parse(initialContent) as PartialBlock[]) : undefined,
    onEditorContentChange: (editorInstance) => {
      onChange(JSON.stringify(editorInstance.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload,
  });

  const insertChartFromToolbar = () => {
    if (!editor || !editable) return;
    const extracted = detectChartDataFromDocument(editor as BlockNoteEditor<any>);
    const value = {
      ...defaultChartValue,
      data: extracted.length > 0 ? extracted : defaultChartValue.data,
    };
    insertOrUpdateBlock(editor, {
      type: "chart",
      props: serializeChart(value),
    } as PartialBlock<any>);
  };

  return (
    <div className="space-y-3">
      {editable && (
        <div className="pl-[54px]">
          <button
            type="button"
            onClick={insertChartFromToolbar}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-secondary transition"
          >
            <Plus className="h-4 w-4" />
            Добавить диаграмму
          </button>
        </div>
      )}
      <BlockNoteView editor={editor} theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  );
}

export default Editor;