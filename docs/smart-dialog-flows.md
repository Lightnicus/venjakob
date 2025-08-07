# Smart Data-Driven Dialog Flows

This document describes the advanced smart dialog flow system implemented for creating intelligent, context-aware dialog sequences that adapt based on real-time data availability and user selections.

## Overview

Smart dialog flows eliminate the need for users to navigate through irrelevant dialogs by automatically determining the optimal path based on:

- **Data Availability**: What data exists in the system
- **User Selections**: What the user has chosen in previous steps  
- **Business Logic**: What operations are actually possible given the current state

## Core Concepts

### Smart Entry Points

Smart entry points are special dialog components that:
1. Check data availability asynchronously
2. Route users to the most appropriate starting dialog
3. Skip unnecessary questions when data doesn't support certain options
4. Provide loading feedback during data checks

### Context-Aware Dialogs

Each dialog in a smart flow can:
- Receive context data through `dialogData` props
- Make routing decisions based on user selections
- Adapt their UI based on available data
- Pass enriched context to subsequent dialogs

### Automatic Back Button Management

The system automatically manages back button visibility:
- Entry point dialogs (first in history) never show back buttons
- Subsequent dialogs show back buttons appropriately
- No manual prop passing required

## Implementation Patterns

### 1. Smart Entry Point Pattern

```tsx
const SmartEntryDialogComponent: FC = () => {
  const { replaceDialog } = useDialogManager();
  const { setLoading } = useLoading();

  useEffect(() => {
    const checkDataAndRoute = async () => {
      try {
        setLoading('data-check', true);
        
        // Parallel data fetching
        const [quotesData, salesOppsData] = await Promise.all([
          fetchQuotes().catch(() => []),
          fetchSalesOpportunities().catch(() => []),
        ]);

        // Data-driven routing logic
        const hasQuotes = quotesData.length > 0;
        const hasSalesOpps = salesOppsData.length > 0;

        if (!hasSalesOpps) {
          toast.error('No sales opportunities available. Create one first.');
          return;
        }

        if (!hasQuotes) {
          replaceDialog('choose-sales-opportunity'); // Skip copy question
        } else {
          replaceDialog('copy-or-new'); // Show all options
        }
      } catch (error) {
        toast.error('Error checking data availability');
      } finally {
        setLoading('data-check', false);
      }
    };

    checkDataAndRoute();
  }, []); // Empty deps - runs once

  return null; // Pure routing component
};
```

**Key Points:**
- Uses `replaceDialog` to avoid polluting dialog history
- Integrates with global loading system
- Handles errors gracefully with user feedback
- Pure routing component that doesn't render UI

### 2. Context-Aware Dialog Pattern

```tsx
const ChooseSalesOpportunityDialog: FC<{
  dialogData?: {
    selectedQuote?: Quote;
    isCopyingFromExisting?: boolean;
  };
}> = ({ dialogData }) => {
  const { openDialog } = useDialogManager();

  const handleSelect = (selectedOpportunity: SalesOpportunity) => {
    const hasExistingQuotes = selectedOpportunity.quotesCount > 0;
    const isCopying = dialogData?.isCopyingFromExisting;

    if (isCopying) {
      // Copy flow - go directly to language selection
      openDialog('language-selection', {
        selectedOpportunity,
        selectedQuote: dialogData.selectedQuote,
        isCopyingFromExisting: true
      });
    } else if (!hasExistingQuotes) {
      // No quotes for this opportunity - skip variant question
      openDialog('language-selection', {
        selectedOpportunity,
        skipVariantQuestion: true
      });
    } else {
      // Has quotes - show variant options
      openDialog('variant-or-version', {
        selectedOpportunity,
        hasExistingQuotes: true
      });
    }
  };

  return (
    <ManagedDialog title="Choose Sales Opportunity" showBackButton={true}>
      <SalesOpportunityList onSelect={handleSelect} />
    </ManagedDialog>
  );
};
```

### 3. Smart Filtering Pattern

The `ChooseSalesOpportunityDialog` implements intelligent filtering to improve user experience:

```tsx
const ChooseSalesOpportunityDialog: FC<ChooseSalesOpportunityDialogProps> = ({
  data = [],
  onWeiter,
  isLoading = false,
}) => {
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);
  
  // Filter data based on checkbox state
  const filteredData = useMemo(() => {
    if (showAllOpportunities) {
      return data; // Show all but disable selection of opportunities with quotes
    }
    return data.filter(opportunity => opportunity.angebote === 0); // Only show opportunities without quotes
  }, [data, showAllOpportunities]);

  const handleRowSelect = (chance: SaleChance) => {
    // Only allow selection of opportunities without quotes
    if (chance.angebote === 0) {
      setSelectedChance(chance);
    }
  };

  return (
    <ManagedDialog title={getDialogTitle()}>
      <div className="flex justify-end mb-2">
        <Checkbox 
          checked={showAllOpportunities}
          onCheckedChange={setShowAllOpportunities}
          disabled={isLoading}
        />
        <span>Zeige alle Verkaufschancen an</span>
      </div>
      {isLoading ? (
        <LoadingIndicator 
          text="Verkaufschancen werden geladen..." 
          variant="centered" 
        />
      ) : filteredData.length === 0 ? (
        <EmptyState message="Es sind derzeit keine Verkaufschancen ohne Angebote verfügbar." />
      ) : (
        <SalesOpportunitiesTable data={filteredData} />
      )}
    </ManagedDialog>
  );
};
```

**Key Features:**
- **Default Filter**: Shows only opportunities without quotes by default
- **Optional Override**: Checkbox allows viewing all opportunities
- **Selection Prevention**: Opportunities with quotes cannot be selected even when visible
- **Visual Feedback**: Disabled rows are visually distinct
- **Empty State**: Clear messaging when no opportunities match criteria
- **Dynamic Title**: Dialog title reflects current filter state and count
- **Loading State**: Proper loading indicator while data is being fetched

### 4. Dialog Configuration Pattern

```tsx
const SMART_DIALOGS = {
  SMART_ENTRY: 'smart-entry',
  COPY_OR_NEW: 'copy-or-new',
  CHOOSE_SALES_OPPORTUNITY: 'choose-sales-opportunity',
  VARIANT_OR_VERSION: 'variant-or-version',
  LANGUAGE_SELECTION: 'language-selection',
} as const;

const createSmartDialogComponents = (onComplete: () => Promise<any>) => [
  { 
    id: SMART_DIALOGS.SMART_ENTRY, 
    component: SmartEntryDialogComponent 
  },
  { 
    id: SMART_DIALOGS.COPY_OR_NEW, 
    component: (props: any) => <CopyOrNewDialog dialogData={props} />
  },
  { 
    id: SMART_DIALOGS.CHOOSE_SALES_OPPORTUNITY, 
    component: (props: any) => <ChooseSalesOpportunityDialog dialogData={props} />
  },
  {
    id: SMART_DIALOGS.VARIANT_OR_VERSION,
    component: (props: any) => <VariantOrVersionDialog dialogData={props} />
  },
  {
    id: SMART_DIALOGS.LANGUAGE_SELECTION,
    component: (props: any) => <LanguageSelectionDialog onComplete={onComplete} dialogData={props} />
  },
];
```

## Flow Decision Matrix

| Data State | User Action | Result Dialog | Skipped Dialogs |
|------------|-------------|---------------|-----------------|
| No Sales Opportunities | Create Quote | Error Message | All |
| No Existing Quotes | Create Quote | Sales Opportunity Selection | Copy Question |
| Has Quotes & Sales Opps | Create Quote | Copy or New Question | None |
| Selected Opp: 0 Quotes | Choose Sales Opp | Language Selection | Variant Question |
| Selected Opp: >0 Quotes | Choose Sales Opp | Variant or Version | None |
| Copy Existing | Any Path | Language Selection | Variant Question |

## Benefits

### User Experience
- **Faster Workflows**: Fewer clicks by skipping irrelevant steps
- **No Confusion**: Users never see options that don't apply to their data
- **Better Guidance**: Clear error messages when prerequisites are missing
- **Consistent Loading**: Professional loading states throughout the flow
- **Smart Filtering**: Only relevant opportunities shown by default

### Developer Experience  
- **Maintainable**: Each dialog has clear responsibilities
- **Testable**: Easy to test different data scenarios
- **Extensible**: Easy to add new routing logic
- **Type Safe**: Full TypeScript support for dialog data

### Performance
- **Parallel Loading**: Multiple data sources fetched simultaneously
- **Frontend Filtering**: Instant filtering without additional API calls
- **Efficient Rendering**: Only necessary components rendered

## Testing Smart Flows

### Test Data Scenarios

```tsx
describe('Smart Dialog Flow', () => {
  it('should skip copy question when no quotes exist', async () => {
    // Mock empty quotes
    mockFetchQuotes.mockResolvedValue([]);
    mockFetchSalesOpportunities.mockResolvedValue([mockSalesOpp]);
    
    openDialog('smart-entry');
    
    await waitFor(() => {
      expect(getCurrentDialog()).toBe('choose-sales-opportunity');
    });
  });

  it('should show copy question when quotes exist', async () => {
    // Mock existing quotes
    mockFetchQuotes.mockResolvedValue([mockQuote]);
    mockFetchSalesOpportunities.mockResolvedValue([mockSalesOpp]);
    
    openDialog('smart-entry');
    
    await waitFor(() => {
      expect(getCurrentDialog()).toBe('copy-or-new');
    });
  });
});
```

### Test User Paths

```tsx
describe('Context-Aware Routing', () => {
  it('should skip variant question for opportunity with no quotes', async () => {
    const opportunityWithNoQuotes = { ...mockSalesOpp, quotesCount: 0 };
    
    renderDialog('choose-sales-opportunity');
    selectOpportunity(opportunityWithNoQuotes);
    
    expect(getCurrentDialog()).toBe('language-selection');
    expect(getDialogData()).toMatchObject({
      selectedOpportunity: opportunityWithNoQuotes,
      skipVariantQuestion: true
    });
  });
});
```

## Best Practices

### Implementation
1. **Keep Smart Entry Components Pure**: They should only handle routing logic
2. **Use `replaceDialog` for Routing**: Prevents dialog history pollution
3. **Handle All Error Cases**: Provide clear feedback for each failure scenario
4. **Parallel Data Fetching**: Use `Promise.all()` for better performance

### UX Design
1. **Fail Gracefully**: Always provide actionable error messages
2. **Show Loading States**: Use global loading system for consistency
3. **Skip Logically**: Only skip dialogs when data truly makes them irrelevant
4. **Preserve Context**: Pass relevant data through the entire flow

### Maintenance
1. **Document Decision Logic**: Clearly comment routing decisions
2. **Test All Paths**: Ensure every combination of data states works
3. **Monitor Performance**: Track data fetching and routing times
4. **Version Dialog Data**: Plan for backwards compatibility in dialog data structures

## Updated Quote Creation Flow

### Language-Driven Creation (2024 Update)

The quote creation system has been enhanced with multi-parameter creation flows that support complete quote structure creation in single operations:

#### Extended Creation Parameters

```tsx
const handleCreateQuote = async (
  salesOpportunityId?: string,
  quoteId?: string,
  variantId?: string,
  versionId?: string,
  languageId?: string
): Promise<QuoteListItem> => {
  // Flow 1: Create new quote with variant and version
  if (!quoteId && !variantId && !versionId && languageId) {
    const result = await createQuoteWithVariantAndVersionAPI({
      title: 'Neues Angebot',
      salesOpportunityId,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      languageId
    });
    
    // Open tab with complete context
    openNewTab({
      id: `quote-${result.quote.id}`,
      title: `${result.quote.title} (${languageLabel})`,
      content: <QuoteDetail 
        quoteId={result.quote.id}
        variantId={result.variant.id}
        language={languageLabel} 
      />,
      closable: true
    });
    
    return result;
  }
  
  // Additional flows for variant/version creation...
};
```

#### Language Selection Integration

The `ChooseOfferLanguageDialog` now properly integrates with the creation flow:

```tsx
const ChooseQuoteLanguageDialogComponent: FC<{ 
  onCreateQuote: (salesOpportunityId?: string, quoteId?: string, variantId?: string, versionId?: string, languageId?: string) => Promise<any>;
  dialogData?: DialogData;
}> = ({ onCreateQuote, dialogData }) => {
  const handleErstellen = async (languageId: string) => {
    const salesOpportunityId = dialogData?.originalSalesOpportunity?.id;
    await onCreateQuote(salesOpportunityId, undefined, undefined, undefined, languageId);
    closeDialog();
  };

  return (
    <ChooseOfferLanguageDialog onErstellen={handleErstellen} />
  );
};
```

#### Key Benefits

1. **Complete Structure Creation**: Quote, variant, and version created in single transaction
2. **Language-Aware**: Selected language properly flows through to creation
3. **Context-Rich Tabs**: Opened tabs receive all necessary IDs for proper context
4. **Environment Configurable**: Quote numbering uses `QUOTE_NUMBER_START` env variable

#### Flow Decision Matrix (Updated)

| Parameters Provided | Result | Created Structure |
|-------------------|---------|------------------|
| `salesOpportunityId` + `languageId` | New quote with full structure | Quote → Variant(1) → Version(1) |
| `quoteId` + `languageId` | New variant for existing quote | Variant(N+1) → Version(1) |
| `quoteId` + `variantId` | New version for existing variant | Version(N+1) |

## Future Enhancements

### Planned Improvements
- **Caching Strategy**: Cache data checks to avoid repeated API calls
- **Progressive Enhancement**: Load additional data as needed during the flow
- **Analytics Integration**: Track which paths users take through flows
- **A/B Testing**: Test different routing strategies
- **Undo/Redo**: Allow users to change their path through the flow
- **Smart Variant/Version Creation**: Implement remaining creation flows (Flows 2 & 3)

### Extension Points
- **Custom Validators**: Allow custom data validation logic
- **Conditional Steps**: Support for complex multi-step validations
- **Dynamic Dialog Loading**: Load dialog components on demand
- **Flow Persistence**: Save and restore dialog flow state 