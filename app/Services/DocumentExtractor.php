<?php

namespace App\Services;

use Symfony\Component\Process\Process;

class DocumentExtractor
{
    public function extract(string $path, string $extension): string
    {
        if ($extension === 'txt' || $extension === 'md') {
            $text = file_get_contents($path);
            if (! mb_check_encoding($text, 'UTF-8')) {
                $text = mb_convert_encoding($text, 'UTF-8', 'Windows-1251');
            }

            return $text;
        }
        if ($extension === 'docx') {
            $zip = new \ZipArchive;
            if ($zip->open($path) !== true) {
                throw new \RuntimeException('Invalid DOCX');
            }
            $stat = $zip->statName('word/document.xml');
            if (! $stat || $stat['size'] > 20000000) {
                $zip->close();
                throw new \RuntimeException('Document too large');
            }
            $xml = $zip->getFromName('word/document.xml');
            $zip->close();
            $dom = new \DOMDocument;
            if (! $dom->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
                throw new \RuntimeException('Invalid XML');
            }
            $xp = new \DOMXPath($dom);
            $xp->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
            $lines = [];
            foreach ($xp->query('//w:p') as $p) {
                $lines[] = $p->textContent;
            }

            return implode("\n", $lines);
        }
        $command = match ($extension) {
            'pdf' => ['pdftotext', '-layout', $path, '-'],'doc' => ['antiword', $path],default => throw new \RuntimeException('Unsupported file')
        };
        $process = new Process($command);
        $process->setTimeout(90);
        $process->mustRun();
        $out = $process->getOutput();
        if (strlen($out) > 2000000) {
            throw new \RuntimeException('Extracted content too large');
        }

        return $out;
    }
}
