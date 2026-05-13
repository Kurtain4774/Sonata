"use client";

export default function PromptInput({ value, onChange, onSubmit, loading }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="w-full"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What are you in the mood for?"
        rows={3}
        maxLength={500}
        className="w-full p-4 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-spotify focus:outline-none resize-none"
      />
      <div className="mt-3 flex justify-center">
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-8 py-3 rounded-full bg-spotify hover:brightness-110 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>
    </form>
  );
}
