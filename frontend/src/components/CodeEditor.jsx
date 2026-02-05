import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Editor from '@monaco-editor/react';

/** Bukkit/Paper API completions for the Monaco editor. */
const JAVA_SUGGESTIONS = [
  // Player methods
  { label: 'player.sendMessage', insertText: 'player.sendMessage("${1:message}");', detail: 'Send a chat message to the player' },
  { label: 'player.sendActionBar', insertText: 'player.sendActionBar("${1:text}");', detail: 'Send action bar text' },
  { label: 'player.getHealth', insertText: 'player.getHealth()', detail: 'Get player health (double)' },
  { label: 'player.setHealth', insertText: 'player.setHealth(${1:20.0});', detail: 'Set player health' },
  { label: 'player.getFoodLevel', insertText: 'player.getFoodLevel()', detail: 'Get player food level (int)' },
  { label: 'player.setFoodLevel', insertText: 'player.setFoodLevel(${1:20});', detail: 'Set player food level' },
  { label: 'player.getInventory', insertText: 'player.getInventory()', detail: 'Get player inventory' },
  { label: 'player.getInventory().addItem', insertText: 'player.getInventory().addItem(new ItemStack(Material.${1:DIAMOND}, ${2:1}));', detail: 'Give item to player' },
  { label: 'player.getLocation', insertText: 'player.getLocation()', detail: 'Get player location' },
  { label: 'player.teleport', insertText: 'player.teleport(${1:location});', detail: 'Teleport player to location' },
  { label: 'player.getWorld', insertText: 'player.getWorld()', detail: 'Get the world the player is in' },
  { label: 'player.getName', insertText: 'player.getName()', detail: 'Get player display name' },
  { label: 'player.getUniqueId', insertText: 'player.getUniqueId()', detail: 'Get player UUID' },
  { label: 'player.hasPermission', insertText: 'player.hasPermission("${1:permission.node}")', detail: 'Check if player has permission' },
  { label: 'player.isOp', insertText: 'player.isOp()', detail: 'Check if player is operator' },
  { label: 'player.kickPlayer', insertText: 'player.kickPlayer("${1:reason}");', detail: 'Kick player from server' },
  { label: 'player.setGameMode', insertText: 'player.setGameMode(GameMode.${1:SURVIVAL});', detail: 'Set player game mode' },
  { label: 'player.addPotionEffect', insertText: 'player.addPotionEffect(new PotionEffect(PotionEffectType.${1:SPEED}, ${2:200}, ${3:1}));', detail: 'Apply potion effect' },
  { label: 'player.setFlying', insertText: 'player.setFlying(${1:true});', detail: 'Set player flying state' },
  { label: 'player.setAllowFlight', insertText: 'player.setAllowFlight(${1:true});', detail: 'Allow or disallow flight' },

  // Event methods
  { label: 'event.setCancelled', insertText: 'event.setCancelled(${1:true});', detail: 'Cancel the event' },
  { label: 'event.isCancelled', insertText: 'event.isCancelled()', detail: 'Check if event is cancelled' },
  { label: 'event.getPlayer', insertText: 'event.getPlayer()', detail: 'Get the player from the event' },

  // World / server
  { label: 'player.getWorld().strikeLightning', insertText: 'player.getWorld().strikeLightning(player.getLocation());', detail: 'Strike lightning at player' },
  { label: 'player.getWorld().createExplosion', insertText: 'player.getWorld().createExplosion(player.getLocation(), ${1:4.0f});', detail: 'Create explosion at player' },
  { label: 'player.getWorld().setTime', insertText: 'player.getWorld().setTime(${1:0});', detail: 'Set world time (0=dawn, 6000=noon)' },
  { label: 'player.getWorld().setStorm', insertText: 'player.getWorld().setStorm(${1:true});', detail: 'Set weather to storm' },
  { label: 'Bukkit.broadcastMessage', insertText: 'Bukkit.broadcastMessage("${1:message}");', detail: 'Broadcast message to all players' },
  { label: 'Bukkit.getOnlinePlayers', insertText: 'Bukkit.getOnlinePlayers()', detail: 'Get all online players' },

  // Common types
  { label: 'new ItemStack', insertText: 'new ItemStack(Material.${1:DIAMOND}, ${2:1})', detail: 'Create a new item stack' },
  { label: 'new Location', insertText: 'new Location(player.getWorld(), ${1:x}, ${2:y}, ${3:z})', detail: 'Create a new location' },
  { label: 'ChatColor', insertText: 'ChatColor.${1:GREEN} + "${2:text}"', detail: 'Colored chat text' },

  // Control flow
  { label: 'if statement', insertText: 'if (${1:condition}) {\n    ${2:// code}\n}', detail: 'If block' },
  { label: 'for each player', insertText: 'for (Player p : Bukkit.getOnlinePlayers()) {\n    ${1:// code}\n}', detail: 'Loop over all online players' },
];

const CodeEditor = forwardRef(function CodeEditor(
  { code, onChange, language = 'java', context = '' },
  ref
) {
  const editorRef = useRef(null);
  const disposableRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Clean up previous provider if re-mounted
    if (disposableRef.current) {
      disposableRef.current.dispose();
    }

    disposableRef.current = monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = JAVA_SUGGESTIONS.map((s) => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: s.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: s.detail,
          range,
        }));

        return { suggestions };
      },
    });
  };

  const insertSnippet = (text) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const position = editor.getPosition();
    editor.executeEdits('snippet', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      text,
    }]);
    editor.focus();
  };

  useImperativeHandle(ref, () => ({
    insertSnippet
  }));

  return (
    <div className="code-editor-wrapper">
      {context && (
        <div className="code-context-hint">
          <strong>Available variables:</strong> {context}
        </div>
      )}
      <div className="code-snippets-bar">
        <span className="code-snippets-label">Insert:</span>
        <button type="button" className="code-snippet-btn" onClick={() => insertSnippet('player.sendMessage("");\n')}>sendMessage</button>
        <button type="button" className="code-snippet-btn" onClick={() => insertSnippet('player.getInventory().addItem(new ItemStack(Material.DIAMOND, 1));\n')}>giveItem</button>
        <button type="button" className="code-snippet-btn" onClick={() => insertSnippet('event.setCancelled(true);\n')}>cancelEvent</button>
        <button type="button" className="code-snippet-btn" onClick={() => insertSnippet('if (player.hasPermission("")) {\n    \n}\n')}>permCheck</button>
        <button type="button" className="code-snippet-btn" onClick={() => insertSnippet('Bukkit.broadcastMessage("");\n')}>broadcast</button>
      </div>
      <Editor
        height="250px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          wordBasedSuggestions: 'currentDocument',
          parameterHints: { enabled: true },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          formatOnPaste: true,
        }}
      />
    </div>
  );
});

export default CodeEditor;
