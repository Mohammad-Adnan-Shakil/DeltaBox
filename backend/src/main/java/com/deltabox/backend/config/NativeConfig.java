package com.deltabox.backend.config;

import com.deltabox.backend.ai.dto.MultiSimulationRequestDTO;
import com.deltabox.backend.ai.dto.MultiSimulationResponseDTO;
import com.deltabox.backend.ai.dto.PredictionRequestDTO;
import com.deltabox.backend.ai.dto.PredictionResponseDTO;
import com.deltabox.backend.ai.dto.RaceContextRequest;
import com.deltabox.backend.ai.dto.SimulationRequestDTO;
import com.deltabox.backend.ai.dto.SimulationResponseDTO;
import com.deltabox.backend.ai.dto.TelemetryAnalysisRequest;
import com.deltabox.backend.dto.ApiResponse;
import com.deltabox.backend.dto.AuthRequest;
import com.deltabox.backend.dto.AuthResponse;
import com.deltabox.backend.dto.DriverComparisonRequest;
import com.deltabox.backend.dto.DriverComparisonResponse;
import com.deltabox.backend.dto.DriverInsightResponse;
import com.deltabox.backend.dto.DriverIntelligenceResponse;
import com.deltabox.backend.dto.FavoriteDriverRequest;
import com.deltabox.backend.dto.GoogleAuthRequest;
import com.deltabox.backend.dto.PodiumDriverDTO;
import com.deltabox.backend.dto.RefreshTokenRequest;
import com.deltabox.backend.dto.UserResponse;
import com.deltabox.backend.dto.UserSummaryResponse;
import com.deltabox.backend.entity.TelemetryCache;
import com.deltabox.backend.exception.ErrorResponse;
import com.deltabox.backend.model.Constructor;
import com.deltabox.backend.model.Driver;
import com.deltabox.backend.model.DriverDTO;
import com.deltabox.backend.model.HistoricalConstructor;
import com.deltabox.backend.model.HistoricalConstructorStandings;
import com.deltabox.backend.model.HistoricalDriver;
import com.deltabox.backend.model.HistoricalDriverStandings;
import com.deltabox.backend.model.HistoricalQualifying;
import com.deltabox.backend.model.HistoricalRace;
import com.deltabox.backend.model.HistoricalResult;
import com.deltabox.backend.model.HistoricalSeason;
import com.deltabox.backend.model.Prediction;
import com.deltabox.backend.model.Race;
import com.deltabox.backend.model.RaceDTO;
import com.deltabox.backend.model.RaceResultDTO;
import com.deltabox.backend.model.SyncMeta;
import com.deltabox.backend.model.Team;
import com.deltabox.backend.model.TeamDTO;
import com.deltabox.backend.model.User;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.TypeReference;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.context.annotation.Configuration;

@Configuration
@ImportRuntimeHints(DeltaBoxRuntimeHints.class)
public class NativeConfig {
}

class DeltaBoxRuntimeHints implements RuntimeHintsRegistrar {

    private static final Class<?>[] DTO_CLASSES = {
        ApiResponse.class,
        AuthRequest.class,
        AuthResponse.class,
        DriverComparisonRequest.class,
        DriverComparisonResponse.class,
        DriverComparisonResponse.DriverComparison.class,
        DriverInsightResponse.class,
        DriverIntelligenceResponse.class,
        FavoriteDriverRequest.class,
        GoogleAuthRequest.class,
        PodiumDriverDTO.class,
        RefreshTokenRequest.class,
        UserResponse.class,
        UserSummaryResponse.class,
        DriverDTO.class,
        RaceDTO.class,
        RaceResultDTO.class,
        TeamDTO.class,
        SimulationRequestDTO.class,
        SimulationResponseDTO.class,
        PredictionRequestDTO.class,
        PredictionResponseDTO.class,
        MultiSimulationRequestDTO.class,
        MultiSimulationResponseDTO.class,
        TelemetryAnalysisRequest.class,
        RaceContextRequest.class,
        ErrorResponse.class,
    };

    private static final Class<?>[] ENTITY_CLASSES = {
        User.class,
        Driver.class,
        Team.class,
        Constructor.class,
        Race.class,
        Prediction.class,
        SyncMeta.class,
        HistoricalSeason.class,
        HistoricalRace.class,
        HistoricalResult.class,
        HistoricalQualifying.class,
        HistoricalConstructor.class,
        HistoricalDriver.class,
        HistoricalConstructorStandings.class,
        HistoricalDriverStandings.class,
        TelemetryCache.class,
    };

    private static final String[] JJWT_CLASSES = {
        "io.jsonwebtoken.impl.DefaultClaims",
        "io.jsonwebtoken.impl.DefaultJws",
        "io.jsonwebtoken.impl.DefaultJwsHeader",
        "io.jsonwebtoken.impl.DefaultHeader",
        "io.jsonwebtoken.impl.DefaultJwt",
        "io.jsonwebtoken.impl.DefaultClaimsBuilder",
    };

    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        registerReflectionAndSerialization(hints, DTO_CLASSES);
        registerReflectionAndSerialization(hints, ENTITY_CLASSES);
        registerJjwtClasses(hints);
    }

    private void registerReflectionAndSerialization(RuntimeHints hints, Class<?>... classes) {
        for (Class<?> clazz : classes) {
            hints.reflection().registerType(clazz,
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_METHODS,
                    MemberCategory.DECLARED_FIELDS);
            hints.serialization().registerType(TypeReference.of(clazz));
        }
    }

    private void registerJjwtClasses(RuntimeHints hints) {
        for (String className : JJWT_CLASSES) {
            try {
                Class<?> clazz = Class.forName(className, false, getClass().getClassLoader());
                hints.reflection().registerType(clazz,
                        MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.DECLARED_FIELDS);
                hints.serialization().registerType(TypeReference.of(clazz));
            } catch (ClassNotFoundException e) {
                // jjwt implementation classes not on classpath — skip
            }
        }
    }
}
