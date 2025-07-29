// src/components/JournalSection.jsx
import React, { useState, useEffect } from "react";
import EmptyJournal from "./Journal/EmptyJournal";
import JournalDisplay from "./Journal/JournalDisplay";
import EntryForm from "./Journal/EntryForm";
import "./JournalSection.css";

const JournalSection = ({
  showJournal,
  entry,
  setEntry,
  entries,
  setEntries,
  handleEntrySubmit,
}) => {
  const [displayedEntries, setDisplayedEntries] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWriteEntry, setShowWriteEntry] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);

  useEffect(() => {
    if (showJournal && entries.length > 0) {
      // If this is the very first time showing journal with entries, type all entries
      if (!hasBeenInitialized) {
        setIsTyping(true);
        setDisplayedEntries([]);

        const typeAllEntries = async () => {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const entryText = entry.text;
            let displayedText = "";

            setDisplayedEntries((prev) => [...prev, { ...entry, text: "" }]);

            for (let j = 0; j <= entryText.length; j++) {
              displayedText = entryText.substring(0, j);
              setDisplayedEntries((prev) =>
                prev.map((e, index) =>
                  index === i ? { ...e, text: displayedText } : e
                )
              );
              await new Promise((resolve) => setTimeout(resolve, 30));
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          setIsTyping(false);
          setHasBeenInitialized(true);
        };

        typeAllEntries();
      } 
      // If switching back to journal after initialization, show all entries immediately
      else if (hasBeenInitialized && displayedEntries.length === 0) {
        setDisplayedEntries([...entries]);
      }
      // If there are new entries, only type the new ones
      else if (entries.length > displayedEntries.length) {
        setIsTyping(true);
        
        const typeNewEntries = async () => {
          const startIndex = displayedEntries.length;
          
          for (let i = startIndex; i < entries.length; i++) {
            const entry = entries[i];
            const entryText = entry.text;
            let displayedText = "";

            setDisplayedEntries((prev) => [...prev, { ...entry, text: "" }]);

            for (let j = 0; j <= entryText.length; j++) {
              displayedText = entryText.substring(0, j);
              setDisplayedEntries((prev) =>
                prev.map((e, index) =>
                  index === i ? { ...e, text: displayedText } : e
                )
              );
              await new Promise((resolve) => setTimeout(resolve, 30));
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          setIsTyping(false);
        };

        typeNewEntries();
      }
      // If an entry was edited, update it immediately without typing animation
      else if (entries.length === displayedEntries.length) {
        setDisplayedEntries([...entries]);
      }
    }
    // Clear displayed entries when hiding journal to prepare for next show
    else if (!showJournal) {
      setDisplayedEntries([]);
    }
  }, [showJournal, entries, hasBeenInitialized]);

  const handleWriteEntryClick = () => {
    setShowWriteEntry(true);
    setEditingIndex(null);
    setEntry("");
  };

  const handleEditEntry = (index) => {
    setEditingIndex(index);
    setEntry(entries[index].text);
    setShowWriteEntry(true);
  };

  const handleDeleteEntry = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this entry?");
    if (confirmDelete) {
      const updated = [...entries];
      updated.splice(index, 1);
      setEntries(updated);
      
      // Update displayed entries immediately without animation
      const updatedDisplayed = [...displayedEntries];
      updatedDisplayed.splice(index, 1);
      setDisplayedEntries(updatedDisplayed);
    }
  };

  const handleSaveEntry = (e) => {
    e.preventDefault();
    
    if (editingIndex !== null) {
      // Editing existing entry
      const updated = [...entries];
      updated[editingIndex] = { text: entry, date: new Date().toISOString() };
      setEntries(updated);
      setEditingIndex(null);
    } else {
      // Adding new entry
      handleEntrySubmit(e);
    }
    
    // Clear the form and hide the writing section
    setEntry("");
    setShowWriteEntry(false);
  };

  const handleCancelEntry = () => {
    setShowWriteEntry(false);
    setEntry("");
    setEditingIndex(null);
  };

  return (
    <div className="journal-section">
      {entries.length === 0 && !showWriteEntry && (
        <EmptyJournal onWriteEntryClick={handleWriteEntryClick} />
      )}

      {entries.length > 0 && !showWriteEntry && (
        <JournalDisplay
          displayedEntries={displayedEntries}
          isTyping={isTyping}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          onWriteEntryClick={handleWriteEntryClick}
        />
      )}

      {showWriteEntry && (
        <EntryForm
          entry={entry}
          setEntry={setEntry}
          editingIndex={editingIndex}
          onSaveEntry={handleSaveEntry}
          onCancelEntry={handleCancelEntry}
        />
      )}
    </div>
  );
};

export default JournalSection;