<?php

namespace App\Services;

class Chunker
{
    public function split(string $text): array
    {
        $text = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $text));
        $size = (int) config('assistent.chunk_chars');
        $overlap = (int) config('assistent.chunk_overlap');
        $chunks = [];
        $start = 0;
        $length = mb_strlen($text);
        while ($start < $length) {
            $end = min($start + $size, $length);
            if ($end < $length) {
                $part = mb_substr($text, $start, $size);
                $boundary = mb_strrpos($part, "\n");
                if ($boundary !== false && $boundary > $size / 2) {
                    $end = $start + $boundary;
                }
            }
            $chunk = trim(mb_substr($text, $start, $end - $start));
            if ($chunk !== '') {
                $chunks[] = $chunk;
            }
            if ($end === $length) {
                break;
            }
            $start = max($start + 1, $end - $overlap);
        }

        return $chunks;
    }
}
