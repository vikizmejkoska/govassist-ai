package mk.govassist.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@ConfigurationProperties(prefix = "app.upload")
public record UploadProperties(
        String dir,
        DataSize maxFileSize
) {
    public UploadProperties {
        if (dir == null || dir.isBlank()) {
            dir = "uploads";
        }
        if (maxFileSize == null) {
            maxFileSize = DataSize.ofMegabytes(5);
        }
    }
}
