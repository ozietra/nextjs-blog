'use client'

// Lexical Rich Text Editor
import { useEffect, useState, useCallback } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { TRANSFORMERS } from '@lexical/markdown'
import {
  $getRoot,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  EditorState,
  LexicalEditor as LexicalEditorType,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $createCodeNode } from '@lexical/code'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
} from 'lucide-react'

const theme = {
  ltr: 'text-left',
  rtl: 'text-right',
  paragraph: 'mb-4',
  quote: 'border-l-4 border-primary pl-4 italic text-muted-foreground my-4',
  heading: {
    h1: 'text-4xl font-bold mb-4 mt-6',
    h2: 'text-3xl font-bold mb-3 mt-5',
    h3: 'text-2xl font-semibold mb-2 mt-4',
    h4: 'text-xl font-semibold mb-2 mt-3',
    h5: 'text-lg font-medium mb-1 mt-2',
    h6: 'text-base font-medium mb-1 mt-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal list-inside mb-4',
    ul: 'list-disc list-inside mb-4',
    listitem: 'mb-1',
  },
  link: 'text-primary underline cursor-pointer',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    code: 'bg-muted px-1 py-0.5 rounded text-sm font-mono',
  },
  code: 'bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 block',
}

interface LexicalEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function LexicalEditor({
  content,
  onChange,
  placeholder = 'İçeriğinizi buraya yazın...',
  className,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'BlogEditor',
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical Error:', error)
    },
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-[400px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] p-4 focus:outline-none prose prose-lg max-w-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <TabIndentationPlugin />
          <OnChangePlugin
            onChange={(editorState, editor) => {
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null)
                onChange(html)
              })
            }}
          />
          <InitialContentPlugin content={content} />
        </div>
        <WordCountPlugin />
      </LexicalComposer>
    </div>
  )
}

// Initial Content Plugin
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    if (isFirstRender && content) {
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(content, 'text/html')
        const nodes = $generateNodesFromDOM(editor, dom)
        const root = $getRoot()
        root.clear()
        nodes.forEach((node) => root.append(node))
      })
      setIsFirstRender(false)
    }
  }, [content, editor, isFirstRender])

  return null
}

// Word Count Plugin
function WordCountPlugin() {
  const [editor] = useLexicalComposerContext()
  const [stats, setStats] = useState({ characters: 0, words: 0 })

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot()
        const text = root.getTextContent()
        setStats({
          characters: text.length,
          words: text.trim() ? text.trim().split(/\s+/).length : 0,
        })
      })
    })
  }, [editor])

  return (
    <div className="flex justify-between items-center px-4 py-2 border-t bg-muted/50 text-xs text-muted-foreground">
      <span>{stats.characters} karakter</span>
      <span>{stats.words} kelime</span>
    </div>
  )
}

// Toolbar Plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor, updateToolbar])

  const formatHeading = (level: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level))
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const formatCodeBlock = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode())
      }
    })
  }

  const insertLink = () => {
    const url = window.prompt('URL girin:')
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
    }
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
      {/* Undo/Redo */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Geri Al"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="İleri Al"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Text Formatting */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          active={isBold}
          title="Kalın"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          active={isItalic}
          title="İtalik"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          active={isUnderline}
          title="Altı Çizili"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
          active={isStrikethrough}
          title="Üstü Çizili"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
          active={isCode}
          title="Kod"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <ToolbarButton onClick={() => formatHeading('h1')} title="Başlık 1">
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatHeading('h2')} title="Başlık 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatHeading('h3')} title="Başlık 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          title="Madde Listesi"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          title="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r pr-2 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
          title="Sola Hizala"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
          title="Ortala"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
          title="Sağa Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
          title="İki Yana Yasla"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Other */}
      <div className="flex gap-1">
        <ToolbarButton onClick={insertLink} title="Link Ekle">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={formatQuote} title="Alıntı">
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={formatCodeBlock} title="Kod Bloğu">
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-accent transition-colors',
        active && 'bg-accent text-accent-foreground',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}
